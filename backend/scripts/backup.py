#!/usr/bin/env python3
"""Database Backup Utility for MaterialHub.

Supports:
- SQLite: Atomic online snapshot using sqlite3 backup API + gzip compression + SHA256 checksum.
- PostgreSQL: pg_dump custom archive format (-Fc) with data integrity verification.

Usage:
    python -m scripts.backup [--output-dir ./backups] [--retention-days 7]
"""

import argparse
import gzip
import hashlib
import os
import shutil
import sqlite3
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.core.config import settings


def compute_sha256(filepath: Path) -> str:
    """Compute SHA-256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def backup_sqlite(db_path: Path, output_dir: Path) -> Path:
    """Safely back up an SQLite database using the native Online Backup API."""
    if not db_path.exists():
        raise FileNotFoundError(f"SQLite database file not found at: {db_path}")

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    raw_backup_path = output_dir / f"materialhub_backup_{timestamp}.db"
    compressed_backup_path = output_dir / f"materialhub_backup_{timestamp}.db.gz"

    print(f"Creating live SQLite backup from {db_path}...")
    src_conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    dst_conn = sqlite3.connect(raw_backup_path)
    with dst_conn:
        src_conn.backup(dst_conn, pages=100)
    dst_conn.close()
    src_conn.close()

    print(f"Compressing backup to {compressed_backup_path}...")
    with open(raw_backup_path, "rb") as f_in:
        with gzip.open(compressed_backup_path, "wb", compresslevel=6) as f_out:
            shutil.copyfileobj(f_in, f_out)

    raw_backup_path.unlink()

    checksum = compute_sha256(compressed_backup_path)
    checksum_file = compressed_backup_path.with_suffix(".gz.sha256")
    checksum_file.write_text(f"{checksum}  {compressed_backup_path.name}\n", encoding="utf-8")

    print(f"Backup created successfully: {compressed_backup_path}")
    print(f"SHA256: {checksum}")
    return compressed_backup_path


def backup_postgres(db_url: str, output_dir: Path) -> Path:
    """Back up PostgreSQL using pg_dump custom format."""
    clean_url = db_url.replace("+asyncpg", "")
    parsed = urlparse(clean_url)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = output_dir / f"materialhub_pg_backup_{timestamp}.dump"

    env = os.environ.copy()
    if parsed.password:
        env["PGPASSWORD"] = parsed.password

    cmd = [
        "pg_dump",
        "-h", parsed.hostname or "localhost",
        "-p", str(parsed.port or 5432),
        "-U", parsed.username or "postgres",
        "-F", "c",
        "-b",
        "-v",
        "-f", str(backup_file),
        parsed.path.lstrip("/"),
    ]

    print(f"Executing pg_dump for database {parsed.path.lstrip('/')}...")
    res = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"pg_dump failed: {res.stderr}")

    checksum = compute_sha256(backup_file)
    checksum_file = backup_file.with_suffix(".dump.sha256")
    checksum_file.write_text(f"{checksum}  {backup_file.name}\n", encoding="utf-8")

    print(f"PostgreSQL backup created successfully: {backup_file}")
    print(f"SHA256: {checksum}")
    return backup_file


def prune_old_backups(output_dir: Path, retention_days: int) -> None:
    """Prune backups older than the retention window."""
    now = datetime.now(timezone.utc).timestamp()
    cutoff_seconds = retention_days * 86400

    for file in output_dir.glob("materialhub_backup_*"):
        if file.is_file():
            file_age = now - file.stat().st_mtime
            if file_age > cutoff_seconds:
                print(f"Pruning expired backup: {file.name}")
                file.unlink()


def main():
    parser = argparse.ArgumentParser(description="MaterialHub Database Backup Tool")
    parser.add_argument("--output-dir", default="./backups", help="Directory to store backups")
    parser.add_argument("--retention-days", type=int, default=7, help="Days to retain backup files")
    parser.add_argument("--db-url", default=None, help="Database URL override")
    args = parser.parse_args()

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    db_url = args.db_url or settings.DATABASE_URL

    if "sqlite" in db_url:
        raw_path = db_url.split(":///")[-1]
        db_path = (backend_root / raw_path).resolve() if not Path(raw_path).is_absolute() else Path(raw_path)
        backup_sqlite(db_path, output_dir)
    elif "postgresql" in db_url or "postgres" in db_url:
        backup_postgres(db_url, output_dir)
    else:
        raise ValueError(f"Unsupported database scheme in URL: {db_url}")

    prune_old_backups(output_dir, args.retention_days)
    print("Backup job completed.")


if __name__ == "__main__":
    main()
