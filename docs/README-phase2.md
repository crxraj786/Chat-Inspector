# Phase 2–4 Implementation

## Run the API

```bash
cp .env.example .env
# Set CHAT_INSPECTOR_API_KEY to a long random value
npm start
```

The API listens on `PORT` (default `3000`). It exposes `/v1/health`, authenticated `/v1/messages/batch`, `/v1/messages`, `/v1/conversations`, `/v1/stats`, `/v1/export?format=json|csv|txt`, and `/v1/analysis`.

This development adapter uses in-memory storage so it can be tested immediately. For Railway production, run `server/schema.sql` against PostgreSQL and replace the in-memory repository with parameterized PostgreSQL queries before enabling production ingestion. Never use a Telegram token or API key in client-side code.

## Dashboard

Serve `dashboard/` behind the same authenticated application or configure its API origin in `window.CHAT_INSPECTOR_API`. It is read-only and includes mobile-first statistics, conversation list, search, direction filter and message thread rendering.

## Telegram

Set `TELEGRAM_BOT_TOKEN` and optionally `TELEGRAM_ALLOWED_CHAT_IDS`. The bot is strictly read-only and supports `/start`, `/status`, `/chats`, `/latest`, `/chat <name>`, and `/search <text>`. It never sends Messenger replies and Telegram is not the source of truth.

## Security gate before production

Use HTTPS, a per-installation API key or stronger short-lived authentication, PostgreSQL transactions with a unique fingerprint constraint, rate limiting, request size limits, secret manager variables, and an owner/admin login for the dashboard. The current in-memory adapter is suitable for local tests and should not be treated as permanent storage.
