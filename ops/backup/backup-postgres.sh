#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DATABASE_URL=postgresql://... ./ops/backup/backup-postgres.sh
# or
#   PGHOST=... PGUSER=... PGPASSWORD=... PGDATABASE=... ./ops/backup/backup-postgres.sh

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/ladyb_lux_event_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

if [[ -n "${DATABASE_URL:-}" ]]; then
  pg_dump "${DATABASE_URL}" | gzip >"${OUTPUT_FILE}"
else
  pg_dump | gzip >"${OUTPUT_FILE}"
fi

echo "Backup created at ${OUTPUT_FILE}"
