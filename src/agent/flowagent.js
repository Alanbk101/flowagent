import dotenv from 'dotenv';
import { executePayment } from '../keeper/executor.js';
import { resolveENS, isENSName, AGENT_IDENTITY } from '../identity/ens.js';
dotenv.config();

const SYSTEM_PROMPT = 'You are FlowAgent (' + 'flowagent.eth), an autonomous financial agent for WhatsApp in LATAM. You help users send USDC/ETH payments. Respond in Spanish, short and clear. When user wants to send payment, respond ONLY with JSON: {"action":"send_payment","to":"address or ENS","amount":"number","token":"ETH"} . For anything else, respond normally as text. Never include markdown.';

export async function processMessage(userMessage, chatHistory) {
  console.log('[FlowAgent] Message: ' + userMessage);
  
  // Check for payment intent keywords
  const paymentKeywords = ['envia', 'manda', 'transfiere', 'send', 'paga', 'enviar', 'mandar'];
  const hasPaymentIntent = paymentKeywords.some(k => userMessage.toLowerCase().includes(k));
  
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(chatHistory || []),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'openai/gpt-oss-120b:free', messages })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const reply = data.choices[0].message.content;
  console.log('[FlowAgent] Reply: ' + reply);

  // Try to parse payment JSON from AI response
  try {
    const parsed = JSON.parse(reply);
    if (parsed.action === 'send_payment' && parsed.to && parsed.amount) {
      // Resolve ENS if needed
      let toAddress = parsed.to;
      if (isENSName(toAddress)) {
        try {
          toAddress = await resolveENS(toAddress);
          console.log('[FlowAgent] ENS resolved: ' + parsed.to + ' -> ' + toAddress);
        } catch (e) {
          return 'No pude resolver ' + parsed.to + '. Verifica el nombre ENS.';
        }
      }
      // Execute payment via KeeperHub
      const result = await executePayment(toAddress, parsed.amount);
      if (result.success) {
        return 'Pago enviado! ' + parsed.amount + ' ETH a ' + parsed.to + ' (' + toAddress.slice(0,6) + '...' + toAddress.slice(-4) + ')';
      } else {
        return 'Error en el pago. Intenta de nuevo.';
      }
    }
  } catch (e) {
    // Not JSON, return as normal text
  }
  return reply;
}
