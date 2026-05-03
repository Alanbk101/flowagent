import dotenv from 'dotenv';
dotenv.config();

export async function processMessage(userMessage, chatHistory) {
  console.log('[FlowAgent] Mensaje: ' + userMessage);
  const messages = [
    { role: 'system', content: 'Eres FlowAgent, un agente financiero autonomo via WhatsApp para LATAM. Ayudas a enviar pagos USDC. Responde en espanol, corto y claro.' },
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
  console.log('[FlowAgent] Respuesta: ' + reply);
  return reply;
}
