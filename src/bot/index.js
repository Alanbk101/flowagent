import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { processMessage } from '../agent/flowagent.js';
import { saveMessage, formatForAgent } from '../memory/agentMemory.js';
import { resolveENS, isENSName } from '../identity/ens.js';
import { executePayment } from '../keeper/executor.js';
dotenv.config();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: {
      level: 'silent',
      log: () => {}, info: () => {}, warn: () => {},
      error: () => {}, debug: () => {}, trace: () => {},
      child: () => ({
        level: 'silent',
        log: () => {}, info: () => {}, warn: () => {},
        error: () => {}, debug: () => {}, trace: () => {},
        child: () => ({})
      })
    }
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 Escanea este QR con WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\n⏳ Esperando escaneo...\n');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;
      if (shouldReconnect) {
        console.log('🔄 Reconectando...');
        startBot();
      } else {
        console.log('❌ Sesión cerrada.');
      }
    }

    if (connection === 'open') {
      console.log('✅ FlowAgent conectado a WhatsApp');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation
      || msg.message.extendedTextMessage?.text
      || '';

    if (!text) return;

    console.log(`📩 ${from}: ${text}`);

    saveMessage(from, 'user', text);
    const history = formatForAgent(from);

    try {
      const response = await processMessage(text, history);
      
      saveMessage(from, 'assistant', response);

      if (isENSName(text) || text.toLowerCase().includes('.eth')) {
        try {
          const address = await resolveENS(
            text.match(/[\w-]+\.eth/)?.[0] || ''
          );
          const finalResponse = response + `\n\n📍 Dirección: ${address}`;
          await sock.sendMessage(from, { text: finalResponse });
        } catch {
          await sock.sendMessage(from, { text: response });
        }
      } else {
        await sock.sendMessage(from, { text: response });
      }

      console.log(`✅ Respuesta enviada`);
    } catch (error) {
      console.error('Error:', error.message);
      await sock.sendMessage(from, {
        text: '❌ Hubo un error. Por favor intenta de nuevo.'
      });
    }
  });
}

console.log('🚀 Iniciando FlowAgent...');
startBot();
  