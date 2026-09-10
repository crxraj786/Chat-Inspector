# Chat-Inspector

Authorized Facebook Messenger web sessions ke liye privacy-first chat backup system. Current repository is an **advanced production-ready codebase**, with deployment requiring the owner's Railway, database, Telegram and authorized browser credentials.

> Use only on accounts and conversations for which you have explicit authorization. This project never collects or transmits Facebook passwords, cookies, session tokens, or browser credentials.

## Completed in code

- Manifest V3 extension restricted to Messenger hosts.
- MutationObserver live detection for visible messages.
- Incoming/outgoing direction, sender, conversation, message type and timestamps.
- Attachment metadata and captured deleted/unsent status.
- SHA-256 fingerprint deduplication.
- Durable local queue with exponential retry uploader.
- HTTPS API ingestion with validation, rate limiting and owner-scoped authentication.
- PostgreSQL schema/repository with immutable backup records and unique fingerprints.
- Session-based dashboard login with logout.
- Mobile-first dashboard with conversations, search, semantic Hindi/English search, filters and statistics.
- JSON, CSV and TXT export.
- Sentiment/topic/important-message analysis panel.
- Telegram read-only commands and optional live notifications.
- Timezone and notification settings.
- Railway deployment descriptor and health check.
- Automated API, security, fixture and integration tests.

## Local validation

```bash
npm install
npm test
npm start
```

Open `http://localhost:3000/` after setting `CHAT_INSPECTOR_API_KEY` and `DEFAULT_OWNER_ID`. The extension can be loaded from `extension/` at `chrome://extensions`.

## Production deployment

Provision a Railway service and PostgreSQL database, apply `server/schema.sql`, and configure the variables in `.env.example`. Never commit those values. Set `DATABASE_URL`, `CHAT_INSPECTOR_API_KEY`, `DEFAULT_OWNER_ID`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_CHAT_IDS`, and optional notification/timezone variables. Railway uses `railway.json` and `/v1/health`.

## Important limitation

The extension can only capture content rendered in the authorized browser tab. It cannot recover a message deleted before capture. Facebook DOM selectors can change, so the parser should be validated against the owner's permitted Messenger session before production use.
