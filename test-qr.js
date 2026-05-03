const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function test() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_test');
  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', function(update) {
    console.log('Update:', update.connection, update.qr ? 'QR PRESENT' : 'no qr');
    if (update.qr) {
      qrcode.generate(update.qr, { small: true });
    }
    if (update.connection === 'open') {
      console.log('CONECTADO!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

test();

