import crypto from 'node:crypto';
const sessions = new Map();
const SESSION_TTL = 8 * 60 * 60 * 1000;
export const login = (ownerId, apiKey, expectedOwner, expectedKey) => { if (!expectedOwner || !expectedKey || ownerId !== expectedOwner || apiKey !== expectedKey) return null; const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, { ownerId, expiresAt: Date.now() + SESSION_TTL }); return { token, expiresAt: new Date(Date.now() + SESSION_TTL).toISOString(), ownerId }; };
export const sessionOwner = (token) => { const item = sessions.get(token); if (!item || item.expiresAt < Date.now()) { if (token) sessions.delete(token); return null; } return item.ownerId; };
export const logout = (token) => sessions.delete(token);
