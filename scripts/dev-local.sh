#!/usr/bin/env bash
# Boot the Nénufar local stack in one command.
#
# Starts Postgres, waits until it accepts connections, applies pending
# migrations and then hands over to `pnpm dev` (:3002 — CONSTITUTION Art. IV).
#
# Usage: pnpm dev:local
set -euo pipefail

cd "$(dirname "$0")/.."

missing=()
for bin in docker pnpm node; do
  command -v "$bin" >/dev/null 2>&1 || missing+=("$bin")
done
if [ "${#missing[@]}" -gt 0 ]; then
  printf 'Missing required tool(s): %s\n' "${missing[*]}" >&2
  printf 'Install them and run `pnpm dev:local` again.\n' >&2
  exit 1
fi

if [ ! -f .env ]; then
  printf 'No .env found — creating one from .env.example.\n'
  printf 'Fill in the secrets (PAYLOAD_SECRET, Telegram token, Groq key) before going live.\n'
  cp .env.example .env
fi

# A remote DATABASE_URL that no longer resolves makes every route return 500.
if grep -qE '^DATABASE_URL=.*' .env && ! grep -E '^DATABASE_URL=' .env | grep -qE '@(127\.0\.0\.1|localhost)'; then
  printf 'WARNING: DATABASE_URL does not point at localhost.\n'
  printf '         If that host is unreachable every page will return 500.\n'
fi

printf 'Starting Postgres...\n'
docker compose up -d postgres

printf 'Waiting for Postgres to accept connections'
for _ in $(seq 1 60); do
  if docker exec nenufar-postgres pg_isready -U postgres >/dev/null 2>&1; then
    printf ' ready\n'
    break
  fi
  printf '.'
  sleep 1
done
if ! docker exec nenufar-postgres pg_isready -U postgres >/dev/null 2>&1; then
  printf '\nPostgres did not become ready in time. Check `docker logs nenufar-postgres`.\n' >&2
  exit 1
fi

printf 'Applying migrations...\n'
# Payload's dev mode (`push: true`) records a marker row with batch = -1, and
# every later `payload migrate` then blocks on an interactive confirm prompt.
# Clearing that dev-only marker keeps this bootstrap non-interactive.
PG_DB="${PG_DB:-nenufar}"
docker exec nenufar-postgres psql -U postgres -d "$PG_DB" \
  -tAc 'DELETE FROM payload_migrations WHERE batch = -1' >/dev/null 2>&1 || true
pnpm payload migrate

printf '\n  Site:  http://localhost:3002\n  Admin: http://localhost:3002/admin (seed: admin@nenufar.com / admin123)\n\n'
exec pnpm dev