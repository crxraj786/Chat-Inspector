# Railway Deployment Runbook

## 1. Create the service

Create a Railway service from the `crxraj786/Chat-Inspector` GitHub repository. Railway will use `railway.json`, install dependencies with `npm ci --omit=dev`, start the service with `npm start`, and check `/v1/health`.

## 2. Provision PostgreSQL

Add a PostgreSQL database to the same Railway project. Apply `server/schema.sql` once against that database. Confirm that the service has a `DATABASE_URL` reference to the provisioned database.

## 3. Configure secrets

Set the following Railway variables without committing their values: `CHAT_INSPECTOR_API_KEY`, `DEFAULT_OWNER_ID`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_CHAT_IDS`, `TELEGRAM_NOTIFICATIONS=true`, `DEFAULT_TIMEZONE=Asia/Kolkata`, and `DATABASE_URL`. Use a long random API key and restrict Telegram chat IDs to the owner.

## 4. Verify

After deployment, open `/v1/health`, then open `/` for the dashboard. Sign in with `DEFAULT_OWNER_ID` and `CHAT_INSPECTOR_API_KEY`. Install the extension from the `extension/` directory, set the Railway HTTPS URL and API key in the popup, open an authorized Messenger conversation, enable capture, and verify a message appears in the dashboard. Run `npm run smoke` locally before deployment.

## Completion boundary

The repository contains the full code path and automated validation. Actual Railway provisioning, database migration, Telegram token configuration, and real Messenger-session validation must be performed in the owner's external accounts; no repository code can perform those actions without those credentials.
