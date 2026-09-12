import { MINT, fetchMetrics, numberValue } from './stonkfun';

export const SOLANA_RPC = ['https://api.mainnet-beta.solana.com', 'https://solana-rpc.publicnode.com'];
export const isWalletAddress = (value: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);

export type HolderSnapshot = {
  wallet: string;
  balance: number | null;
  positionValueUsd: number | null;
  eligible: boolean | null;
  priceUsd: number | null;
  totalEarnedUsd: null;
  totalPaidUsd: null;
  unpaidRewardsUsd: null;
  nextPayoutUsd: null;
  holdingDuration: null;
  firstDetectedAt: null;
  lastPayoutAt: null;
  feeEntitlementPct: null;
  holderRank: null;
};

export function shortenWallet(wallet: string) {
  return wallet.length > 12 ? wallet.slice(0, 5) + '…' + wallet.slice(-4) : wallet;
}

export function formatToken(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

export function formatUsdValue(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);
}

async function rpc(method: string, params: unknown[]) {
  let lastError: Error | null = null;
  for (const endpoint of SOLANA_RPC) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      if (!response.ok) throw new Error('RPC HTTP ' + response.status);
      const data = await response.json() as { error?: unknown; result?: unknown };
      if (data.error) throw new Error('RPC rejected the request');
      return data.result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Solana RPC unavailable');
    }
  }
  throw lastError || new Error('Solana RPC unavailable');
}
export async function getHolderSnapshot(wallet: string): Promise<HolderSnapshot> {
  if (!isWalletAddress(wallet)) throw new Error('Enter a valid Solana wallet address.');

  const [tokenAccounts, market] = await Promise.all([
    rpc('getTokenAccountsByOwner', [wallet, { mint: MINT }, { encoding: 'jsonParsed' }]) as Promise<{ value?: Array<{ account?: { data?: { parsed?: { info?: { tokenAmount?: { uiAmount?: number | null } } } } } }> }>,
    fetchMetrics(),
  ]);

  const balance = (tokenAccounts.value || []).reduce((total, account) => total + (account.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0), 0);
  const priceUsd = numberValue(market.values.price);
  const positionValueUsd = priceUsd === null ? null : balance * priceUsd;
  const eligible = positionValueUsd === null ? null : positionValueUsd >= 20;

  return {
    wallet,
    balance,
    positionValueUsd,
    eligible,
    priceUsd,
    totalEarnedUsd: null,
    totalPaidUsd: null,
    unpaidRewardsUsd: null,
    nextPayoutUsd: null,
    holdingDuration: null,
    firstDetectedAt: null,
    lastPayoutAt: null,
    feeEntitlementPct: null,
    holderRank: null,
  };
}