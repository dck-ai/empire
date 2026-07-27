#!/usr/bin/env bash
# Hit production sheet sync. Requires APP_URL and CRON_SECRET in the environment.
set -euo pipefail

curl -fsS -X GET \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Accept: application/json" \
  --max-time 90 \
  "${APP_URL%/}/api/cron/sync-sheets"
