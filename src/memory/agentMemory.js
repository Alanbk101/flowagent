import fs from 'fs';
import path from 'path';

// 0G Storage configuration (decentralized persistence layer)
const ZG_CONFIG = {
  evmRpc: 'https://evmrpc-testnet.0g.ai',
  indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
  privateKey: process.env.ZG_PRIVATE_KEY || ''
};

const MEMORY_DIR = '/root/flowagent/data/memory';
const conversations = new Map();

if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// Local disk persistence (fallback + cache)
function loadFromDisk(userId) {
  const f = path.join(MEMORY_DIR, userId + '.json');
  if (fs.existsSync(f)) {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  }
  return [];
}

function saveToDisk(userId, history) {
  fs.writeFileSync(path.join(MEMORY_DIR, userId + '.json'), JSON.stringify(history));
}

// 0G Storage integration (async, non-blocking)
async function syncTo0G(userId, history) {
  try {
    if (!ZG_CONFIG.privateKey) return;
    const { Indexer, ZgFile } = await import('@0glabs/0g-ts-sdk');
    const { ethers } = await import('ethers');
    
    const tmpFile = '/tmp/0g_memory_' + userId + '.json';
    fs.writeFileSync(tmpFile, JSON.stringify({ userId, history, updatedAt: Date.now() }));
    
    const provider = new ethers.JsonRpcProvider(ZG_CONFIG.evmRpc);
    const signer = new ethers.Wallet(ZG_CONFIG.privateKey, provider);
    const indexer = new Indexer(ZG_CONFIG.indexerRpc);
    const file = await ZgFile.fromFilePath(tmpFile);
    
    var [tx, err] = await indexer.upload(file, ZG_CONFIG.evmRpc, signer);
    if (err === null) {
      console.log('[0G] Memory synced for ' + userId + ', tx: ' + tx);
    } else {
      console.log('[0G] Sync failed: ' + err);
    }
    await file.close();
    fs.unlinkSync(tmpFile);
  } catch (e) {
    console.log('[0G] Sync skipped: ' + e.message);
  }
}

export function saveMessage(userId, role, content) {
  if (!conversations.has(userId)) {
    conversations.set(userId, loadFromDisk(userId));
  }
  const h = conversations.get(userId);
  h.push({ role, content, timestamp: Date.now() });
  if (h.length > 20) h.shift();
  saveToDisk(userId, h);
  // Async sync to 0G (non-blocking)
  syncTo0G(userId, h).catch(() => {});
}

export function getHistory(userId) {
  if (!conversations.has(userId)) {
    conversations.set(userId, loadFromDisk(userId));
  }
  return conversations.get(userId) || [];
}

export function formatForAgent(userId) {
  return getHistory(userId).map(function(msg) {
    return { role: msg.role, content: msg.content };
  });
}
