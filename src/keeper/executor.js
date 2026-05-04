const KEEPERHUB_WEBHOOK = 'https://app.keeperhub.com/api/workflows/o4vqk9rtiszx67ahzztdc/webhook';
const KEEPERHUB_API_KEY = 'kh_j-3L2puERs4WL3RHQzzj98CQxOH3UGVa';
export async function executePayment(toAddress, amount) {
  console.log('[KeeperHub] Sending ' + amount + ' ETH to ' + toAddress);
  const response = await fetch(KEEPERHUB_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEEPERHUB_API_KEY },
    body: JSON.stringify({ to_address: toAddress, amount: String(amount) })
  });
  const data = await response.json();
  if (response.ok) { console.log('[KeeperHub] TX submitted:', data); return { success: true, data }; }
  console.error('[KeeperHub] Error:', data);
  return { success: false, data };
}