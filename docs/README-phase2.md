# Phase 2–4 Implementation

## Run the API

```bash
cp .env.example .env
# Set CHAT_INSPECTOR_API_KEY to a long random value
npm start
```

The API listens on `PORT` (default `3000`). It exposes `/v1/health`, authenticated `/v1/messages/batch`, `/v1/messages`, `/v1/conversations`, `/v1/stats`, `/v1/export?format=json|csv|txt`, and `/v1/analysis`.

When `DATABASE_URL` is present, the API uses the PostgreSQL repository with parameterized queries and the unique `messages.fingerprint` constraint. Without it, the in-memory adapter remains available for local tests only. For Railway production, run `server/schema.sql` against PostgreSQL. Never use a Telegram token or API key in client-side code.

Set `DEFAULT_OWNER_ID` to enable owner-scoped access; clients must send the matching `X-Owner-Id` header. All authenticated routes are rate-limited (default 120 requests per IP per minute; configure with `RATE_LIMIT_PER_MINUTE`).

## Dashboard

Serve `dashboard/` behind the same authenticated application or configure its API origin in `window.CHAT_INSPECTOR_API`. It is read-only and includes mobile-first statistics, conversation list, search, direction filter and message thread rendering.

## Telegram

Set `TELEGRAM_BOT_TOKEN` and optionally `TELEGRAM_ALLOWED_CHAT_IDS`. The bot is strictly read-only and supports `/start`, `/status`, `/chats`, `/latest`, `/chat <name>`, and `/search <text>`. It never sends Messenger replies and Telegram is not the source of truth.

## Security gate before production

Use HTTPS, a per-installation API key or stronger short-lived authentication, PostgreSQL transactions with a unique fingerprint constraint, rate limiting, request size limits, secret manager variables, and an owner/admin login for the dashboard. The current in-memory adapter is suitable for local tests and should not be treated as permanent storage.
