# Architecture — Phase 1

The prototype is intentionally split into three layers. The **content script** observes only the visible Messenger DOM and converts candidate nodes into a normalized record. The **service worker** owns local durable state, deduplication and event diagnostics. The **popup** exposes user controls to pause capture and clear the local queue.

```text
Authorized Messenger tab
        |
        v
MutationObserver -> defensive parser -> normalized record
                                      |
                                      v
                         chrome.runtime message
                                      |
                                      v
                 Service worker: fingerprint + local queue
                                      |
                                      v
                         Popup diagnostics / user controls
```

## Reliability behavior

Every accepted record gets a SHA-256 fingerprint from account, conversation, sender, text and source timestamp. Fingerprints are kept alongside queued records, so repeated DOM mutations are ignored. Queue records retain retry fields (`attempts`, `nextRetryAt`) for the next HTTPS uploader phase. Until a secure API endpoint and authentication method are provisioned, no network upload is attempted.

## Privacy boundary

The extension does not request cookies, tabs, webRequest, identity, or scripting permissions. It does not inspect browser credentials and has no code path for sending Messenger messages. Only normalized metadata and message content from visible nodes enter extension-local storage. Backend credentials will be provisioned as environment/secret-manager configuration in a later server phase, never committed to source.

## Phase 2 design gate

Before enabling upload, validate representative fixtures for incoming, outgoing, text, attachment metadata, deleted/unsent retention and timezone conversion. The server must authenticate the extension, enforce schema limits, create a unique database constraint on fingerprint, avoid content logging, and return per-record accepted/duplicate/error statuses.
