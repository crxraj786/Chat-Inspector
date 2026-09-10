import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { incomingFixture, outgoingFixture, deletedAttachmentFixture } from './fixtures.js';

const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const normalizeDirection = (value) => { const text = normalize(value).toLowerCase(); if (/outgoing|sent|you|self|from you/.test(text)) return 'outgoing'; if (/incoming|received|from /.test(text)) return 'incoming'; return 'unknown'; };
const fingerprint = (record) => crypto.createHash('sha256').update([record.accountRef, record.conversationRef, record.senderRef, record.messageText, record.sourceTimestamp].map(normalize).join('|')).digest('hex');

test('normalizes whitespace without changing message meaning', () => assert.equal(normalize('  hello\n  world  '), 'hello world'));
test('fixture directions and timestamps are represented', () => { assert.equal(normalizeDirection(incomingFixture.attributes['data-direction']), 'incoming'); assert.equal(normalizeDirection(outgoingFixture.attributes['data-direction']), 'outgoing'); assert.match(incomingFixture.attributes['data-timestamp'], /Z$/); });
test('deleted attachment fixture retains its metadata contract', () => { assert.equal(deletedAttachmentFixture.attributes['aria-label'], 'Message deleted'); assert.equal(deletedAttachmentFixture.attachment.type, 'image'); });
test('normalizes incoming and outgoing directions', () => { assert.equal(normalizeDirection('Sent by You'), 'outgoing'); assert.equal(normalizeDirection('Received from Neeraj'), 'incoming'); assert.equal(normalizeDirection('system event'), 'unknown'); });
test('same message produces stable fingerprint', () => { const record = { accountRef: 'a', conversationRef: 'c', senderRef: 'n', messageText: 'hello', sourceTimestamp: '2026-09-10T06:00:00Z' }; assert.equal(fingerprint(record), fingerprint({ ...record })); });
test('meaningfully different message does not collide in fixture', () => { const base = { accountRef: 'a', conversationRef: 'c', senderRef: 'n', sourceTimestamp: '2026-09-10T06:00:00Z' }; assert.notEqual(fingerprint({ ...base, messageText: 'hello' }), fingerprint({ ...base, messageText: 'goodbye' })); });
test('manifest does not request cookies or broad host permissions', () => { const manifest = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8')); assert.deepEqual(manifest.permissions.sort(), ['alarms', 'storage']); assert.ok(manifest.host_permissions.every((host) => host.includes('facebook.com/messages') || host.includes('messenger.com'))); assert.equal(manifest.background.service_worker, 'background/service-worker.js'); });
test('source contains no auto-reply or credential collection APIs', () => { const files = ['extension/content/observer.js', 'extension/background/service-worker.js'].map((p) => fs.readFileSync(p, 'utf8')).join('\n'); assert.doesNotMatch(files, /document\.cookie|chrome\.cookies|password|session.?token/i); assert.doesNotMatch(files, /auto.?reply|reply\s*\(/i); });
