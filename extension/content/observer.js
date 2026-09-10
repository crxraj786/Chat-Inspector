(() => {
  const U = globalThis.ChatInspectorUtils;
  const state = { enabled: true, seenNodes: new WeakSet(), observer: null };
  const textOf = (root, selectors) => {
    for (const selector of selectors) {
      const node = root.querySelector?.(selector);
      const value = U.normalize(node?.textContent || node?.getAttribute?.('aria-label'));
      if (value) return value;
    }
    return '';
  };
  const parseMessage = (node) => {
    const messageText = textOf(node, ['[data-scope="message-text"]', '[data-testid*="message-text"]', '[dir="auto"]']) || U.normalize(node.textContent);
    if (!messageText || messageText.length > 10000) return null;
    const conversationName = textOf(document, ['header [dir="auto"]', '[data-testid="conversation-info-header"] [dir="auto"]']) || 'Unknown conversation';
    const senderName = textOf(node, ['[data-sender-name]', '[data-testid*="sender"]', 'h3', 'strong']) || (node.getAttribute('aria-label') || '').split(':')[0] || 'Unknown sender';
    const direction = U.normalizeDirection(node.getAttribute('data-direction') || node.getAttribute('aria-label') || node.className);
    const sourceTimestamp = U.parseTimestamp(node.getAttribute('data-timestamp') || node.querySelector('time')?.getAttribute('datetime') || node.querySelector('time')?.textContent);
    const attachments = [...node.querySelectorAll('img,video,audio,a[href]')].map((item) => ({ type: item.tagName.toLowerCase(), name: U.normalize(item.getAttribute('aria-label') || item.getAttribute('alt') || item.textContent).slice(0, 200), url: item.tagName.toLowerCase() === 'a' ? item.getAttribute('href')?.slice(0, 500) : undefined })).filter((item) => item.name || item.url).slice(0, 20);
    const deleted = /unsent|deleted|removed|हटा दिया|डिलीट/i.test(`${node.getAttribute('aria-label') || ''} ${node.textContent}`) ? 'source_deleted' : 'active';
    return { accountRef: 'local-session', conversationRef: location.pathname, conversationName, senderRef: senderName.toLowerCase(), senderName, direction, messageText, messageType: U.detectMessageType(node), sourceTimestamp, capturedAt: new Date().toISOString(), attachments, deletedStatus: deleted, source: 'messenger-dom' };
  };
  const emit = async (node) => {
    if (state.seenNodes.has(node) || !state.enabled) return;
    state.seenNodes.add(node);
    const record = parseMessage(node);
    if (!record) return;
    record.fingerprint = await U.hash(U.fingerprintInput(record));
    chrome.runtime.sendMessage({ type: 'MESSAGE_DETECTED', record });
  };
  const scan = (root = document) => {
    const nodes = root.querySelectorAll?.('[data-message-id], [data-testid*="message"], [role="row"]') || [];
    nodes.forEach(emit);
  };
  chrome.runtime.onMessage.addListener((message) => { if (message?.type === 'SET_CAPTURE') state.enabled = Boolean(message.enabled); });
  chrome.storage.local.get({ captureEnabled: true }).then((data) => { state.enabled = data.captureEnabled !== false; });
  chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.captureEnabled) state.enabled = changes.captureEnabled.newValue !== false; });
  scan();
  state.observer = new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => { if (node.nodeType === Node.ELEMENT_NODE) { emit(node); scan(node); } })));
  state.observer.observe(document.body, { childList: true, subtree: true });
})();
