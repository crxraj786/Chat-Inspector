const DEFAULTS = { captureEnabled: true, queue: [], fingerprints: [], events: [] };
const read = (keys = null) => chrome.storage.local.get(keys || DEFAULTS);
const writeEvent = async (type, record = {}) => {
  const data = await read();
  const events = [{ type, fingerprint: record.fingerprint?.slice(0, 22), at: new Date().toISOString() }, ...data.events].slice(0, 50);
  await chrome.storage.local.set({ events });
};
const enqueue = async (record) => {
  const data = await read();
  if (data.fingerprints.includes(record.fingerprint)) { await writeEvent('duplicate_ignored', record); return { duplicate: true }; }
  const queue = [...data.queue, { ...record, attempts: 0, nextRetryAt: Date.now() }];
  await chrome.storage.local.set({ queue, fingerprints: [...data.fingerprints, record.fingerprint] });
  await writeEvent('message_queued', record);
  return { queued: true, size: queue.length };
};
chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set(DEFAULTS));
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message?.type === 'MESSAGE_DETECTED') sendResponse(await enqueue(message.record));
    else if (message?.type === 'GET_STATE') sendResponse(await read());
    else if (message?.type === 'CLEAR_QUEUE') { await chrome.storage.local.set({ queue: [], fingerprints: [] }); await writeEvent('queue_cleared'); sendResponse({ ok: true }); }
    else if (message?.type === 'SET_CAPTURE') { await chrome.storage.local.set({ captureEnabled: Boolean(message.enabled) }); sendResponse({ ok: true }); }
  })();
  return true;
});
