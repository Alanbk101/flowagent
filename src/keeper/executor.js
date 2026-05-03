import dotenv from 'dotenv';
dotenv.config();

export async function executePayment({ recipient, amount, token = 'USDC' }) {
  console.log(`[KeeperHub] Executing: ${amount} ${token} to ${recipient}`);
  return { jobId: 'pending', status: 'not_configured' };
}

export async function getJobStatus(jobId) {
  return { jobId, status: 'pending' };
}
