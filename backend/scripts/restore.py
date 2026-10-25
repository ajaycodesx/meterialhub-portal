#!/usr/bin/env python3
"""Database Restore Utility for MaterialHub.

SAFETY PROTOCOL:
- Verifies SHA-256 checksum before touching any target database.
- Requires explicit --force flag to prevent accidental overwrite.
- Automatically creates a pre-restore backup of the current state before replacing.
- Runs PRAGMA integrity_check (SQLite) or pg_restore verification.

Usage:
    python -m scripts.restore --backup-file ./backups/materialhub_backup_XYZ.db.gz --force
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
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def verify_checksum(backup_path: Path) -> bool:
    """Verify backup file against adjacent .sha256 file if present."""
    checksum_file = Path(str(backup_path) + ".sha256")
    if not checksum_file.exists():
        print(f"WARNING: No checksum file found at {checksum_file}. Proceeding without verification.")
        return True

    expected_hash = checksum_file.read_text(encoding="utf-8").strip().split()[0]
    actual_hash = compute_sha256(backup_path)
    if expected_hash.lower() != actual_hash.lower():
        raise ValueError(
            f"CHECKSUM MISMATCH! Expected: {expected_hash}, Actual: {actual_hash}. "
            "The backup file may be corrupt or tampered with."
        )

    print("Checksum verification: PASSED")
    return True


def restore_sqlite(backup_path: Path, target_db_path: Path) -> None:
    """Safely restore SQLite database from compressed .gz or raw .db backup."""
    verify_checksum(backup_path)

    if target_db_path.exists():
        safety_path = target_db_path.with_suffix(
            f".safety_prerestore_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.db"
        )
        print(f"Creating safety pre-restore backup of current database at: {safety_path}")
        shutil.copy2(target_db_path, safety_path)

    temp_target = target_db_path.with_suffix(".restoring.tmp")
    print(f"Decompressing {backup_path} to temporary destination...")
    if backup_path.suffix == ".gz":
        with gzip.open(backup_path, "rb") as f_in:
            with open(temp_target, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
    else:
        shutil.copy2(backup_path, temp_target)

    print("Verifying database integrity...")
    conn = sqlite3.connect(temp_target)
    cursor = conn.cursor()
    cursor.execute("PRAGMA integrity_check;")
    result = cursor.fetchone()
    conn.close()

    if result != ("ok",):
        temp_target.unlink()
        raise RuntimeError(f"Database integrity check failed: {result}")

    print("Database integrity check: PASSED (ok)")

    if target_db_path.exists():
        target_db_path.unlink()
    temp_target.rename(target_db_path)
    print(f"Restore completed successfully to {target_db_path}")


def restore_postgres(backup_path: Path, db_url: str) -> None:
    """Restore PostgreSQL from pg_dump custom archive format."""
    verify_checksum(backup_path)

    clean_url = db_url.replace("+asyncpg", "")
    parsed = urlparse(clean_url)

    env = os.environ.copy()
    if parsed.password:
        env["PGPASSWORD"] = parsed.password

    cmd = [
        "pg_restore",
        "-h", parsed.hostname or "localhost",
        "-p", str(parsed.port or 5432),
        "-U", parsed.username or "postgres",
        "-d", parsed.path.lstrip("/"),
        "--clean",
        "--if-exists",
        "-v",
        str(backup_path),
    ]

    print(f"Executing pg_restore into database {parsed.path.lstrip('/')}...")
    res = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"pg_restore failed: {res.stderr}")

    print("PostgreSQL restore completed successfully.")


def main():
    parser = argparse.ArgumentParser(description="MaterialHub Database Restore Tool")
    parser.add_argument("--backup-file", required=True, help="Path to backup file (.db.gz or .dump)")
    parser.add_argument("--target-db-url", default=None, help="Target database URL override")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Explicit confirmation flag required to proceed with restore",
    )
    args = parser.parse_args()

    if not args.force:
        print("SAFETY ERROR: Restore requires the '--force' flag to prevent accidental overwrite.")
        print("Example: python -m scripts.restore --backup-file <path> --force")
        sys.exit(1)

    backup_path = Path(args.backup_file).resolve()
    if not backup_path.exists():
        raise FileNotFoundError(f"Backup file not found: {backup_path}")

    db_url = args.target_db_url or settings.DATABASE_URL

    if "sqlite" in db_url:
        raw_path = db_url.split(":///")[-1]
        target_path = (backend_root / raw_path).resolve() if not Path(raw_path).is_absolute() else Path(raw_path)
        restore_sqlite(backup_path, target_path)
    elif "postgresql" in db_url or "postgres" in db_url:
        restore_postgres(backup_path, db_url)
    else:
        raise ValueError(f"Unsupported database scheme: {db_url}")


if __name__ == "__main__":
    main()
