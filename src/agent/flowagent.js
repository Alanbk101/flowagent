import dotenv from 'dotenv';
dotenv.config();

export async function processMessage(userMessage, chatHistory = []) {
  console.log(`[FlowAgent] Mensaje recibido: ${userMessage}`);

  const messages = [
    {
      role: 'system',
      content: `Eres FlowAgent, un agente financiero autónomo que opera via WhatsApp para usuarios en LATAM.
Ayudas a los usuarios a enviar pagos en USDC, consultar saldos y gestionar sus finanzas onchain.
Cuando un usuario quiera enviar dinero, extrae: destinatario, monto y confirma antes de ejecutar.
Responde siempre en español, de forma corta y clara — esto es WhatsApp, no un email.
Si el usuario saluda, responde amigable y pregunta en qué le puedes ayudar.`
    },
    ...chatHistory,
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/Alanbk101/flowagent',
      'X-Title': 'FlowAgent'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b:free',
      messages: messages
    })
  });

  const data = await response.json();

  if (data.error) {
    console.error('[FlowAgent] Error:', data.error);
    throw new Error(data.error.message);
  }

  const reply = data.choices[0].message.content;
  console.log(`[FlowAgent] Respuesta: ${reply}`);
  return reply;
}