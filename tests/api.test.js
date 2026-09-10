import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 3217;
let child;
before(async () => { child = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, PORT: String(port), CHAT_INSPECTOR_API_KEY: 'test-key', DEFAULT_OWNER_ID: 'test-owner' } }); await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('server timeout')), 3000); child.stdout.on('data', (buf) => { if (buf.toString().includes('listening')) { clearTimeout(timer); resolve(); } }); child.on('error', reject); }); });
after(() => child?.kill());
const request = (path, options = {}) => fetch(`http://127.0.0.1:${port}${path}`, { ...options, headers: { authorization: 'Bearer test-key', 'x-owner-id': 'test-owner', 'content-type': 'application/json', ...(options.headers || {}) } });

test('health is public and reports service status', async () => { const r = await fetch(`http://127.0.0.1:${port}/v1/health`); assert.equal(r.status, 200); assert.equal((await r.json()).ok, true); });
test('owner scope is required on protected routes', async () => { const r = await fetch(`http://127.0.0.1:${port}/v1/stats`, { headers: { authorization: 'Bearer test-key' } }); assert.equal(r.status, 401); });
test('ingestion validates auth and deduplicates fingerprints', async () => { const record = { fingerprint: 'sha256:test-1', conversationRef: '/messages/t/1', conversationName: 'Neeraj', senderName: 'Neeraj', direction: 'incoming', messageText: 'भाई कहाँ हो?', capturedAt: new Date().toISOString() }; const denied = await fetch(`http://127.0.0.1:${port}/v1/messages/batch`, { method: 'POST', body: JSON.stringify({ messages: [record] }), headers: { 'content-type': 'application/json' } }); assert.equal(denied.status, 401); const first = await request('/v1/messages/batch', { method: 'POST', body: JSON.stringify({ messages: [record] }) }); assert.equal((await first.json()).accepted.length, 1); const second = await request('/v1/messages/batch', { method: 'POST', body: JSON.stringify({ messages: [record] }) }); assert.equal((await second.json()).duplicates.length, 1); });
test('search returns stored message without exposing secrets', async () => { const r = await request('/v1/messages?q=कहाँ'); const body = await r.json(); assert.equal(body.messages.length, 1); assert.equal(body.messages[0].messageText, 'भाई कहाँ हो?'); assert.equal(body.messages[0].apiKey, undefined); });
test('export and analysis are read-only and return structured results', async () => { const csv = await request('/v1/export?format=csv'); assert.equal(csv.status, 200); assert.match(await csv.text(), /conversation,sender,direction/); const analysis = await request('/v1/analysis'); const body = await analysis.json(); assert.equal(body.sentiment, 'neutral'); assert.equal(body.topic, 'family'); });
