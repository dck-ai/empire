# Empire Reservation

Staff board for Empire Cuisine reservations.

- Master Google Sheet = append-only intake
- Postgres = source for the website; staff edit arrival, finished, food reservation, remarks
- Capacity from hall template; no write-back to Sheets

## Env

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | yes | Postgres |
| `BETTER_AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | no | Default: `VERCEL_URL` or `http://localhost:3000` |
| `GOOGLE_SHEET_ID` | sync | First tab of the spreadsheet |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | sync | SA key JSON — raw minified JSON, or base64 (recommended for `.env` / Vercel) |
| `CRON_SECRET` | scheduled sync | `openssl rand -hex 32`; Bearer secret for external callers of `GET /api/cron/sync-sheets` |
| `SEED_USER_EMAIL` | seed | Staff login email |
| `SEED_USER_PASSWORD` | seed | Min 8 chars |
| `SEED_USER_NAME` | no | Default `Staff` |

Copy: `cp .env.example .env.local` (and `.env` for Prisma CLI).

### Google service account (`GOOGLE_SERVICE_ACCOUNT_JSON`)

1. In Google Cloud: create a service account → **Keys** → **Add key** → JSON → download (e.g. `file-sa.json`).
2. Share the Master Sheet with that account’s `client_email` as **Viewer**.
3. Put the key in env as **base64** (avoids broken newlines / quoting in `.env` and Vercel):

```bash
# Linux (GNU coreutils) — no line wraps
base64 -w0 file-sa.json

# macOS
base64 -i file-sa.json | tr -d '\n'

# Cross-platform (openssl)
openssl base64 -A -in file-sa.json
```

Paste the single-line output into `.env` / Vercel:

```bash
GOOGLE_SERVICE_ACCOUNT_JSON="<paste-base64-here>"
```

Raw JSON also works if it is valid one-line JSON. The app accepts either form (base64 is decoded automatically).

## Setup

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```
## Deploy (Vercel)

1. Managed Postgres + env from the table above (including `CRON_SECRET` if you use scheduled sync below).
2. On release / schema change: `npm run db:push` (or `npx prisma db push`) against that DB.
3. Seed once with `SEED_USER_*` then `npm run db:seed` against prod DB.

This app does **not** use Vercel Cron Jobs or GitHub Actions for scheduling. Run the sync from an external cron (e.g. your VPS).
