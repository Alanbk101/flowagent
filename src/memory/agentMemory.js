import fs from 'fs';
import path from 'path';
const MEMORY_DIR = '/root/flowagent/data/memory';
const conversations = new Map();
if (!fs.existsSync(MEMORY_DIR)) { fs.mkdirSync(MEMORY_DIR, { recursive: true }); }
function loadFromDisk(userId) { const f = path.join(MEMORY_DIR, userId + '.json'); if (fs.existsSync(f)) { return JSON.parse(fs.readFileSync(f, 'utf8')); } return []; }
function saveToDisk(userId, history) { fs.writeFileSync(path.join(MEMORY_DIR, userId + '.json'), JSON.stringify(history)); }
export function saveMessage(userId, role, content) { if (!conversations.has(userId)) { conversations.set(userId, loadFromDisk(userId)); } const h = conversations.get(userId); h.push({ role, content, timestamp: Date.now() }); if (h.length > 20) h.shift(); saveToDisk(userId, h); }
export function getHistory(userId) { if (!conversations.has(userId)) { conversations.set(userId, loadFromDisk(userId)); } return conversations.get(userId) || []; }
export function formatForAgent(userId) { return getHistory(userId).map(function(msg) { return { role: msg.role, content: msg.content }; }); }