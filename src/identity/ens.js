const ENS_API='https://api.ensideas.com/ens/resolve';
export async function resolveENS(n){if(n.startsWith('0x'))return n;if(n.indexOf('.eth')<0)return n;const r=await fetch(ENS_API+'/'+n);const d=await r.json();if(d.address)return d.address;throw new Error('Not found: '+n)}
export function isENSName(i){return i.indexOf('.eth')>=0}
export const AGENT_IDENTITY={name:'flowagent.eth',description:'FlowAgent - Autonomous USDC payments via WhatsApp for LATAM',url:'https://github.com/Alanbk101/flowagent',twitter:'@ACryp0b'};