# MaterialHub — Database Backup & Disaster Recovery Runbook

## Overview
This runbook documents operational procedures for backing up, verifying, and safely restoring the MaterialHub database.

---

## 1. Automated Backup Procedures

### SQLite (Local / Staging Single-Instance)
For SQLite deployments, MaterialHub uses the native `sqlite3.backup` C-level API, which creates a non-blocking, point-in-time snapshot of the database while transactions are occurring, followed by Gzip compression (level 6) and SHA-256 checksum generation.

```bash
# Execute backup
python -m scripts.backup --output-dir ./backups --retention-days 7
```

**Artifacts generated:**
- `materialhub_backup_YYYYMMDD_HHMMSS.db.gz` (Gzip compressed SQLite snapshot)
- `materialhub_backup_YYYYMMDD_HHMMSS.db.gz.sha256` (SHA-256 integrity hash)

### PostgreSQL (Production Distributed)
For production PostgreSQL instances, MaterialHub uses `pg_dump` with the custom archive format (`-Fc`), enabling compression, blob archiving, and parallel restore capabilities.

```bash
# Execute PostgreSQL backup (reads DATABASE_URL from .env or environment)
python -m scripts.backup --output-dir ./backups --retention-days 14
```

**Direct CLI equivalent:**
```bash
pg_dump -h $PGHOST -p 5432 -U $PGUSER -F c -b -v -f ./backups/materialhub_$(date +%Y%m%d_%H%M%S).dump materialhub_prod
sha256sum ./backups/materialhub_*.dump > ./backups/materialhub_*.dump.sha256
```

---

## 2. Retention & Pruning Policy

| Tier | Frequency | Retention Window | Storage Target |
| :--- | :--- | :--- | :--- |
| **Hourly Snapshots** | Every 1 hour | 48 hours | Local / Primary disk |
| **Daily Backups** | Every 24 hours (02:00 UTC) | 14 days | Encrypted Object Storage (AWS S3 / Cloudflare R2) |
| **Weekly Archives** | Every Sunday | 12 weeks | Cold Glacier / Deep Archive |
| **Monthly Compliance** | 1st of month | 1 year | Cold Glacier / Deep Archive |

The `scripts/backup.py` tool automatically enforces local retention via the `--retention-days` parameter.

---

## 3. Encryption at Rest & Offsite Replication

1. **Client-Side GPG Encryption:**
   ```bash
   gpg --symmetric --cipher-algo AES256 ./backups/materialhub_backup_YYYYMMDD_HHMMSS.db.gz
   ```
2. **S3 Replication with Server-Side KMS Encryption:**
   ```bash
   aws s3 cp ./backups/materialhub_backup_YYYYMMDD_HHMMSS.db.gz.gpg \
     s3://materialhub-prod-backups/database/ \
     --sse aws:kms \
     --sse-kms-key-id alias/materialhub-backup-key
   ```
3. **Access Control:**
   - The backup S3 bucket must have **Object Lock (WORM)** enabled to prevent ransomware tampering.
   - Restrict bucket access to a dedicated `materialhub-backup-writer` IAM role using least-privilege policies.

---

## 4. Disaster Recovery & Restore Runbook

> [!CAUTION]
> **NEVER execute a restore against a production database without:**
> 1. Verifying the SHA-256 checksum of the backup archive.
> 2. Generating an automatic pre-restore safety snapshot of the existing database.
> 3. Verifying database integrity in an isolated staging or disposable environment first.

### Restore Execution Steps

```bash
# Step 1: Verify checksum and restore (safety pre-restore backup created automatically)
python -m scripts.restore --backup-file ./backups/materialhub_backup_20261018_224500.db.gz --force

# For custom target location:
python -m scripts.restore \
  --backup-file ./backups/materialhub_backup_20261018_224500.db.gz \
  --target-db-url sqlite+aiosqlite:///./test_restored.db \
  --force
```

### Safety Features of `scripts.restore`:
1. **Pre-Restore Safety Snapshot**: Automatically copies the active database to `*.safety_prerestore_<timestamp>.db` before applying any changes.
2. **Checksum Guard**: Compares against the SHA-256 signature file and terminates if any bit is altered.
3. **Integrity Probe**: Executes `PRAGMA integrity_check` (SQLite) or `pg_restore` verification before final atomic file rename.
4. **Mandatory `--force` Flag**: Rejects execution without explicit operator consent.

---

## 5. Routine Recovery Drill Schedule
Disaster recovery tests must be run quarterly on an isolated staging database to prove:
- RTO (Recovery Time Objective): < 15 minutes.
- RPO (Recovery Point Objective): < 1 hour.
