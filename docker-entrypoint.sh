#!/bin/sh
set -e

chown -R svelte:nodejs /data || true

echo "[entrypoint] Running migrations (npm run db:migrate)"
su svelte -c "npm run db:migrate"

echo "[entrypoint] Starting app…"
su svelte -c "$*"
