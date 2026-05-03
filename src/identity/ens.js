const ENS_API = 'https://api.ensideas.com/ens/resolve';

export async function resolveENS(nameOrAddress) {
  if (nameOrAddress.startsWith('0x')) return nameOrAddress;
  if (!nameOrAddress.endsWith('.eth')) return nameOrAddress;
  try {
    const response = await fetch(`${ENS_API}/${nameOrAddress}`);
    const data = await response.json();
    if (data.address) return data.address;
    throw new Error(`No address found for ${nameOrAddress}`);
  } catch (error) {
    throw error;
  }
}

export function isENSName(input) {
  return input.endsWith('.eth');
}

export const AGENT_IDENTITY = {
  name: 'flowagent.eth',
  description: 'FlowAgent — Autonomous USDC payments via WhatsApp for LATAM',
  url: 'https://github.com/Alanbk101/flowagent',
  twitter: '@ACryp0b'
};
