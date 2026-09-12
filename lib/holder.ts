import { MINT, USDC, fetchMetrics, numberValue } from './stonkfun';

export const SOLANA_RPC = ['https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com'];
const STONKFUN_URL = 'https://www.stonkfun.xyz';
const STONKFUN_PAYOUT_AUTHORITY = '5KXDF6QnqhBj72hDtJNkkpFaQVUfbFXNybMsp3DiK6tD';
const MAX_HISTORY = 250;

export const isWalletAddress = (value: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);

type TokenAccount = { pubkey?: string; account?: { data?: { parsed?: { info?: { tokenAmount?: { uiAmount?: number | null } } } } } };
type Signature = { signature?: string; blockTime?: number | null };
type TokenBalance = { mint?: string; owner?: string; uiTokenAmount?: { uiAmount?: number | null; amount?: string; decimals?: number } };
type ParsedTransaction = { blockTime?: number | null; transaction?: { message?: { accountKeys?: Array<{ pubkey?: string; signer?: boolean }> } }; meta?: { preTokenBalances?: TokenBalance[] | null; postTokenBalances?: TokenBalance[] | null } | null };
type StonkRewards = { pendingUsd?: number; minHoldingUsd?: number };
type StonkHolders = { holders?: Array<{ address?: string; rank?: number }>; supplyTokens?: number };

export type HolderSnapshot = {
  wallet: string;
  balance: number | null;
  positionValueUsd: number | null;
  eligible: boolean | null;
  priceUsd: number | null;
  totalEarnedUsd: number | null;
  payoutCount: number | null;
  unpaidRewardsUsd: number | null;
  nextPayoutUsd: number | null;
  holdingDuration: number | null;
  firstDetectedAt: string | null;
  lastPayoutAt: string | null;
  feeEntitlementPct: number | null;
  holderRank: number | null;
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

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  for (const endpoint of SOLANA_RPC) {
    try {
      const response = await fetch(endpoint, { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
      if (!response.ok) throw new Error('RPC HTTP ' + response.status);
      const data = await response.json() as { error?: unknown; result?: T };
      if (data.error || data.result === undefined) throw new Error('RPC rejected the request');
      return data.result;
    } catch { /* Try the next public RPC endpoint. */ }
  }
  throw new Error('Solana RPC unavailable');
}

async function rpcBatch<T>(method: string, params: unknown[][]): Promise<Array<T | null>> {
  if (!params.length) return [];
  for (const endpoint of SOLANA_RPC) {
    try {
      const response = await fetch(endpoint, { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(params.map((value, index) => ({ jsonrpc: '2.0', id: index + 1, method, params: value }))) });
      if (!response.ok) throw new Error('RPC HTTP ' + response.status);
      const rows = await response.json() as Array<{ id?: number; error?: unknown; result?: T }>;
      const values = rows.sort((a, b) => (a.id || 0) - (b.id || 0)).map((row) => row.error ? null : row.result ?? null);
      if (values.some((value) => value !== null)) return values;
      throw new Error('RPC rejected the batch request');
    } catch { /* Try the next public RPC endpoint. */ }
  }
  // Some public Solana RPCs reject JSON-RPC batches. Fall back to individual
  // requests so a card still has the wallet's own history rather than false zeroes.
  return Promise.all(params.map((value) => rpc<T>(method, value).catch(() => null)));
}

async function stonkJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(STONKFUN_URL + path, { cache: 'no-store', headers: { accept: 'application/json' } });
    return response.ok ? await response.json() as T : null;
  } catch { return null; }
}

function tokenTotal(accounts: TokenAccount[]) {
  return accounts.reduce((total, account) => total + (account.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0), 0);
}
function isoTime(seconds: number | null | undefined) {
  return typeof seconds === 'number' && Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : null;
}
function usdcDelta(transaction: ParsedTransaction, wallet: string) {
  const amount = (balances: TokenBalance[] | null | undefined) => (balances || []).reduce((total, row) => row.mint === USDC && row.owner === wallet ? total + (row.uiTokenAmount?.uiAmount ?? (row.uiTokenAmount?.amount ? Number(row.uiTokenAmount.amount) / 10 ** (row.uiTokenAmount.decimals || 6) : 0)) : total, 0);
  return amount(transaction.meta?.postTokenBalances) - amount(transaction.meta?.preTokenBalances);
}
function isStonkFunPayout(transaction: ParsedTransaction) {
  return transaction.transaction?.message?.accountKeys?.some((key) => key.pubkey === STONKFUN_PAYOUT_AUTHORITY && key.signer === true) === true;
}
async function accountSignatures(addresses: string[]) {
  // getSignaturesForAddress returns an array directly, unlike token-account RPCs.
  const pages = await Promise.all(addresses.map((address) => rpc<Signature[]>('getSignaturesForAddress', [address, { limit: MAX_HISTORY }]).catch(() => [])));
  return Array.from(new Map(pages.flat().filter((row) => row.signature).map((row) => [row.signature as string, row])).values());
}

export async function getHolderSnapshot(wallet: string, options: { includeHistory?: boolean } = {}): Promise<HolderSnapshot> {
  if (!isWalletAddress(wallet)) throw new Error('Enter a valid Solana wallet address.');
  const includeHistory = options.includeHistory !== false;
  const [ubiResult, usdcResult, market, rewards, holders] = await Promise.all([
    rpc<{ value?: TokenAccount[] }>('getTokenAccountsByOwner', [wallet, { mint: MINT }, { encoding: 'jsonParsed' }]),
    includeHistory ? rpc<{ value?: TokenAccount[] }>('getTokenAccountsByOwner', [wallet, { mint: USDC }, { encoding: 'jsonParsed' }]) : Promise.resolve({ value: [] }),
    fetchMetrics(),
    stonkJson<StonkRewards>('/api/rewards?mint=' + encodeURIComponent(MINT)),
    stonkJson<StonkHolders>('/api/token-holders?mint=' + encodeURIComponent(MINT)),
  ]);
  const ubiAccounts = ubiResult.value || [];
  const balance = tokenTotal(ubiAccounts);
  const priceUsd = numberValue(market.values.price);
  const positionValueUsd = priceUsd === null ? null : balance * priceUsd;
  const minimumHoldingUsd = rewards?.minHoldingUsd ?? null;
  const eligible = positionValueUsd === null || minimumHoldingUsd === null ? null : positionValueUsd >= minimumHoldingUsd;
  const supply = holders?.supplyTokens ?? null;
  const share = supply && supply > 0 ? balance / supply : null;
  const estimatedPending = eligible === true && share !== null && rewards?.pendingUsd !== undefined ? rewards.pendingUsd * share : null;
  const rank = holders?.holders?.find((holder) => holder.address === wallet)?.rank ?? null;

  let firstDetectedAt: string | null = null;
  let holdingDuration: number | null = null;
  let totalEarnedUsd: number | null = null;
  let payoutCount: number | null = null;
  let lastPayoutAt: string | null = null;
  if (includeHistory) {
    const [ubiHistory, usdcHistory] = await Promise.all([
      accountSignatures(ubiAccounts.map((account) => account.pubkey || '').filter(Boolean)),
      accountSignatures((usdcResult.value || []).map((account) => account.pubkey || '').filter(Boolean)),
    ]);
    const first = ubiHistory.map((row) => row.blockTime).filter((value): value is number => typeof value === 'number').sort((a, b) => a - b)[0];
    firstDetectedAt = isoTime(first);
    holdingDuration = first ? Math.max(0, Math.floor((Date.now() / 1000 - first) / 86400)) : null;
    const transactions: ParsedTransaction[] = [];
    for (let index = 0; index < usdcHistory.length; index += 20) {
      const signatures = usdcHistory.slice(index, index + 20).map((row) => row.signature).filter((value): value is string => Boolean(value));
      const batch = await rpcBatch<ParsedTransaction>('getTransaction', signatures.map((signature) => [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }])).catch(() => []);
      for (const transaction of batch) {
        if (transaction !== null) transactions.push(transaction);
      }
    }
    const payouts = transactions.map((transaction) => ({ transaction, amount: usdcDelta(transaction, wallet) })).filter(({ transaction, amount }) => isStonkFunPayout(transaction) && amount > 0);
    totalEarnedUsd = payouts.reduce((total, payout) => total + payout.amount, 0);
    payoutCount = payouts.length;
    const latest = payouts.map((payout) => payout.transaction.blockTime).filter((value): value is number => typeof value === 'number').sort((a, b) => b - a)[0];
    lastPayoutAt = isoTime(latest);
  }

  return { wallet, balance, positionValueUsd, eligible, priceUsd, totalEarnedUsd, payoutCount, unpaidRewardsUsd: estimatedPending, nextPayoutUsd: estimatedPending, holdingDuration, firstDetectedAt, lastPayoutAt, feeEntitlementPct: share === null ? null : share * 100, holderRank: rank };
}
