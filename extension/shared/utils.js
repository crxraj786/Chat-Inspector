(() => {
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const hash = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return 'sha256:' + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  };
  const parseTimestamp = (value) => {
    const text = normalize(value);
    if (!text) return null;
    const parsed = Date.parse(text);
    return Number.isNaN(parsed) ? text : new Date(parsed).toISOString();
  };
  const normalizeDirection = (value) => {
    const text = normalize(value).toLowerCase();
    if (/outgoing|sent|you|self|from you/.test(text)) return 'outgoing';
    if (/incoming|received|from /.test(text)) return 'incoming';
    return 'unknown';
  };
  const detectMessageType = (node) => {
    const text = `${node?.getAttribute?.('data-message-type') || ''} ${node?.className || ''}`.toLowerCase();
    if (/image|photo/.test(text)) return 'image';
    if (/video/.test(text)) return 'video';
    if (/audio|voice/.test(text)) return 'audio';
    if (/file|document/.test(text)) return 'file';
    if (/sticker/.test(text)) return 'sticker';
    if (/gif/.test(text)) return 'gif';
    return 'text';
  };
  const fingerprintInput = (record) => [record.accountRef, record.conversationRef, record.senderRef, record.messageText, record.sourceTimestamp].map(normalize).join('|');
  globalThis.ChatInspectorUtils = { normalize, hash, parseTimestamp, normalizeDirection, detectMessageType, fingerprintInput };
})();
