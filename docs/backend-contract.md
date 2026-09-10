# Backend Contract (Phase 2)

The extension will send only normalized message records over authenticated HTTPS. It must never send Facebook cookies, access tokens, passwords, DOM snapshots, or arbitrary page HTML.

## Ingestion endpoint

`POST /v1/messages/batch`

Headers:

- `Authorization: Bearer <Chat-Inspector API key>` (extension-specific secret provisioned outside source control)
- `Content-Type: application/json`
- `Idempotency-Key: <batch fingerprint>`

Body:

```json
{"messages":[{"conversationRef":"...","senderName":"...","direction":"incoming","messageText":"...","messageType":"text","sourceTimestamp":"...","capturedAt":"...","fingerprint":"sha256:...","attachments":[]}]}
```

Server requirements:

- Validate schema and size limits; reject unknown/oversized fields.
- Store `fingerprint` under a unique constraint; duplicate records return `duplicate` rather than creating rows.
- Keep `capturedAt` immutable and retain backup records independently of source deletion/unsend.
- Never log message content. Log event type, fingerprint prefix, account ref and timing only.
- Rate-limit ingestion and use environment variables for all Telegram/database/API secrets.
- Provide `GET /v1/health` and authenticated read endpoints for dashboard/Telegram.

## Privacy and authorization

The extension runs only in the user-authorized browser session. It reads visible message metadata from the page; it does not access cookies or browser storage outside its own extension storage. The user must be able to pause capture and clear the local queue.
