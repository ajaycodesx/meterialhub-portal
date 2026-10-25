import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent


def test_alembic_upgrade_and_downgrade_disposable():
    """Verify that Alembic migrations run cleanly against a disposable database."""
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db_path = Path(temp_dir) / "test_migration.db"
        test_db_url = f"sqlite+aiosqlite:///{test_db_path.as_posix()}"

        res = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"url={test_db_url}", "upgrade", "head"],
            cwd=str(backend_root),
            capture_output=True,
            text=True,
        )
        assert res.returncode == 0, f"Alembic upgrade failed: {res.stderr}\nOutput: {res.stdout}"

        conn = sqlite3.connect(test_db_path)
        tables = [
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
            ).fetchall()
        ]
        conn.close()

        expected_tables = {
            "alembic_version",
            "users",
            "merchants",
            "categories",
            "commodity_rates",
            "deals",
            "products",
            "orders",
            "order_items",
            "delivery_trips",
            "boq_quotes",
        }
        for expected in expected_tables:
            assert expected in tables, f"Expected table '{expected}' missing from migrated database: {tables}"

        res_down = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"url={test_db_url}", "downgrade", "base"],
            cwd=str(backend_root),
            capture_output=True,
            text=True,
        )
        assert res_down.returncode == 0, f"Alembic downgrade failed: {res_down.stderr}\nOutput: {res_down.stdout}"

        conn = sqlite3.connect(test_db_path)
        tables_after_downgrade = [
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'alembic_version';"
            ).fetchall()
        ]
        conn.close()
        assert len(tables_after_downgrade) == 0, f"Tables still present after downgrade: {tables_after_downgrade}"
