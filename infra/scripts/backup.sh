#!/usr/bin/env sh
set -eu

ENV_FILE="${1:-infra/.env.production}"
BACKUP_DIR="${2:-backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"

docker compose --env-file "$ENV_FILE" -f infra/compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB:-moonkid}" -Fc \
  > "$BACKUP_DIR/moonkid-$STAMP.dump"

echo "Created $BACKUP_DIR/moonkid-$STAMP.dump"
