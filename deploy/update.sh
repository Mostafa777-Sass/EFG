#!/usr/bin/env bash
# Pulls the latest code, applies migrations, rebuilds and restarts the service.
# Usage (on the server, as the deploy user): ./deploy/update.sh
set -euo pipefail

cd "$(dirname "$0")/.."

git pull --ff-only
pnpm install --frozen-lockfile
pnpm db:deploy          # prisma migrate deploy
pnpm db:seed            # only creates rows that are still missing
pnpm build              # prisma generate + next build + standalone assets
sudo systemctl restart egf-website
sudo systemctl --no-pager --lines=5 status egf-website
