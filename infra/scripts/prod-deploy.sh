#!/usr/bin/env sh
set -eu

ENV_FILE="${1:-infra/.env.production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing production environment file: $ENV_FILE" >&2
  exit 1
fi

docker compose \
  --env-file "$ENV_FILE" \
  -f infra/compose.prod.yml \
  config --quiet

docker compose \
  --env-file "$ENV_FILE" \
  -f infra/compose.prod.yml \
  pull --ignore-buildable

docker compose \
  --env-file "$ENV_FILE" \
  -f infra/compose.prod.yml \
  up -d --build --remove-orphans

docker compose \
  --env-file "$ENV_FILE" \
  -f infra/compose.prod.yml \
  ps
