# Chat-Inspector

Authorized Facebook Messenger web sessions ke liye privacy-first chat backup foundation. Current milestone **Phase 1: browser detection prototype** hai.

> Use only on accounts and conversations for which you have explicit authorization. This project never collects or transmits Facebook passwords, cookies, session tokens, or browser credentials.

## What is implemented

- Manifest V3 Chrome extension restricted to `www.facebook.com/messages/*` and `www.messenger.com/*`.
- MutationObserver-based live detection for visible Messenger message nodes.
- Incoming/outgoing direction detection using semantic labels, author comparison, and DOM class heuristics.
- Conversation, sender, message text, message type, source timestamp and capture timestamp extraction.
- Stable fingerprinting and duplicate protection.
- Durable `chrome.storage.local` offline queue with exponential retry metadata.
- Popup diagnostics: capture on/off, queue size, recent detection events, clear queue.
- No auto-reply or message sending capability.
- Unit tests for fingerprinting, timestamp parsing, direction normalization and queue behavior.

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose `extension/`.
4. Open an authorized Messenger session, navigate to a conversation, and open the extension popup.
5. Enable capture and inspect the queue/events. The prototype defaults to local queue only; API upload is intentionally disabled until the backend is configured.

Facebook periodically changes its DOM. Parser selectors are deliberately configurable and defensive; use the built-in diagnostics to tune selectors against a permitted test account.

## Test

```bash
npm test
```

## Repository layout

```text
extension/
  manifest.json          Manifest V3 configuration
  content/observer.js    Live DOM observer and message parser
  background/service-worker.js  Local queue, dedupe and retry state
  popup/                 Diagnostics UI
  shared/                Pure utilities and schemas
tests/                   Node test suite
docs/                    Architecture and backend contract
```

## Planned next phases

1. Validate detection against representative authorized Messenger DOM fixtures.
2. Add authenticated HTTPS ingestion API and database unique constraint on fingerprint.
3. Add dashboard, Telegram read-only notifications, search, export and AI analysis.

The backend contract is documented in `docs/backend-contract.md`; no secret or token is committed to this repository.
