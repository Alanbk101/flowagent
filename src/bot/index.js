import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { processMessage } from '../agent/flowagent.js';
import { saveMessage, formatForAgent } from '../memory/agentMemory.js';
dotenv.config();

const logger = pino({ level: 'error' });

export async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    browser: ['FlowAgent', 'Chrome', '1.0.0'],
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\nEscanea este QR con WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\nEsperando escaneo...\n');
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log('Reconectando en 5s...');
        setTimeout(connectBot, 5000);
      } else {
        console.log('Sesion cerrada.');
      }
    }

    if (connection === 'open') {
      console.log('FlowAgent conectado a WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation
      || msg.message?.extendedTextMessage?.text
      || '';
    if (!text) return;

    console.log(`Mensaje de ${from}: ${text}`);
    saveMessage(from, 'user', text);
    const history = formatForAgent(from);

    try {
      const response = await processMessage(text, history);
      saveMessage(from, 'assistant', response);
      await sock.sendMessage(from, { text: response });
      console.log('Respuesta enviada');
    } catch (err) {
      console.error('Error:', err.message);
      await sock.sendMessage(from, { text: 'Error, intenta de nuevo.' });
    }
  });
}

console.log('Iniciando FlowAgent...');
connectBot().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
