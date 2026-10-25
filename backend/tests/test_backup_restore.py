import sqlite3
import tempfile
from pathlib import Path
import pytest

from scripts.backup import backup_sqlite, compute_sha256
from scripts.restore import restore_sqlite


def test_backup_and_restore_sqlite_lifecycle():
    with tempfile.TemporaryDirectory() as temp_dir:
        dir_path = Path(temp_dir)
        source_db = dir_path / "source.db"
        output_dir = dir_path / "backups"
        output_dir.mkdir()
        target_db = dir_path / "restored.db"

        conn = sqlite3.connect(source_db)
        conn.execute("CREATE TABLE products (id TEXT PRIMARY KEY, title TEXT, price REAL)")
        conn.execute("INSERT INTO products VALUES ('p1', 'UltraTech Cement', 385.0)")
        conn.commit()
        conn.close()

        backup_file = backup_sqlite(source_db, output_dir)
        assert backup_file.exists()
        assert backup_file.name.endswith(".db.gz")

        checksum_file = backup_file.with_suffix(".gz.sha256")
        assert checksum_file.exists()
        expected_hash = compute_sha256(backup_file)
        assert checksum_file.read_text().strip().startswith(expected_hash)

        restore_sqlite(backup_file, target_db)
        assert target_db.exists()

        restored_conn = sqlite3.connect(target_db)
        row = restored_conn.execute("SELECT id, title, price FROM products WHERE id='p1'").fetchone()
        restored_conn.close()
        assert row == ("p1", "UltraTech Cement", 385.0)

        conn2 = sqlite3.connect(target_db)
        conn2.execute("INSERT INTO products VALUES ('p2', 'Tata Tiscon', 62000.0)")
        conn2.commit()
        conn2.close()

        restore_sqlite(backup_file, target_db)
        safety_backups = list(dir_path.glob("restored.safety_prerestore_*.db"))
        assert len(safety_backups) == 1, "Expected pre-restore safety backup to be created"


def test_restore_rejects_corrupted_checksum():
    with tempfile.TemporaryDirectory() as temp_dir:
        dir_path = Path(temp_dir)
        source_db = dir_path / "source.db"
        output_dir = dir_path / "backups"
        output_dir.mkdir()
        target_db = dir_path / "restored.db"

        conn = sqlite3.connect(source_db)
        conn.execute("CREATE TABLE t (x INT)")
        conn.commit()
        conn.close()

        backup_file = backup_sqlite(source_db, output_dir)

        checksum_file = backup_file.with_suffix(".gz.sha256")
        checksum_file.write_text("invalid_tampered_hash_0000000000000000  filename\n")

        with pytest.raises(ValueError) as exc_info:
            restore_sqlite(backup_file, target_db)
        assert "CHECKSUM MISMATCH" in str(exc_info.value)
