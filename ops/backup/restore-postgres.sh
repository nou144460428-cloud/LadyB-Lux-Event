#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# Usage:
#   DATABASE_URL=postgresql://... ./ops/backup/restore-postgres.sh backups/file.sql.gz
# or
#   PGHOST=... PGUSER=... PGPASSWORD=... PGDATABASE=... ./ops/backup/restore-postgres.sh backups/file.sql.gz

if [[ -n "${DATABASE_URL:-}" ]]; then
  gunzip -c "${BACKUP_FILE}" | psql "${DATABASE_URL}"
else
  gunzip -c "${BACKUP_FILE}" | psql
fi

echo "Restore completed from ${BACKUP_FILE}"
