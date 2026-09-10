# Production Readiness

The application now includes authenticated dashboard sessions, owner-scoped API access, rate limiting, PostgreSQL persistence, attachment metadata, retained deleted/unsent status, semantic Hindi/English search, CSV/TXT/JSON export, basic analysis, Telegram read-only commands, optional live notifications, and a Railway deployment descriptor.

The browser prototype has fixture coverage for incoming, outgoing, attachment, deleted-status, fingerprint and permission boundaries. The content script uses only its own extension storage and visible DOM metadata; it does not request browser cookies or credentials.

## Railway deployment checklist

Create a Railway service from this repository, provision PostgreSQL, apply `server/schema.sql`, and set `PORT`, `DATABASE_URL`, `CHAT_INSPECTOR_API_KEY`, `DEFAULT_OWNER_ID`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_CHAT_IDS`, and `TELEGRAM_NOTIFICATIONS`. Never paste these values into GitHub. The service health check is `/v1/health`.

## Current boundaries

The extension can only capture information rendered in the authorized Messenger tab. It cannot recover a message that was deleted before capture, and it does not access Facebook cookies, passwords, or session credentials. AI analysis is currently deterministic and privacy-preserving; an external LLM can be added later behind a server-side policy and secret manager if required.
