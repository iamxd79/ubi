import { MINT } from '@/lib/stonkfun';
import { STONK_BOARD_URL, type StonkBoardSnapshot } from '@/lib/stonk-board';

type SourceCoin = {
  rank?: number; mint?: string; symbol?: string; graduatedAt?: string; priceUsd?: number; marketCapUsd?: number;
  volume24hUsd?: number; change24h?: number; chart?: Array<{ close?: number }>; quote?: { symbol?: string };
  yield?: {
    apr24h?: number; apy24h?: number; apr3d?: number; apy3d?: number; apr7d?: number; apy7d?: number;
    eligibleSupplyPct?: number; minHoldingUsd?: number; holderCount?: number; note?: string;
  };
  rewardsPaid?: { usd?: number; payoutCount?: number; lastPayoutAt?: string };
};

function extractObject(html: string, marker: string): unknown {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error('Stonk Board data marker not found');
  const start = html.indexOf('{', markerIndex + marker.length);
  if (start === -1) throw new Error('Stonk Board data did not contain an object');
  let depth = 0, string = false, escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (string) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') string = false;
      continue;
    }
    if (character === '"') string = true;
    else if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(html.slice(start, index + 1));
    }
  }
  throw new Error('Stonk Board data object was incomplete');
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function feeEntitlement(note?: string): number | null {
  const match = note?.match(/\(([\d.]+)% of active pool liquidity\)/i);
  return match ? Number(match[1]) : null;
}

function snapshotFrom(source: unknown): StonkBoardSnapshot {
  const shared = source as { coin?: SourceCoin; marketAt?: string; enrichmentAt?: string };
  const coin = shared.coin;
  if (!coin || coin.mint !== MINT) throw new Error('UBI was not present in Stonk Board data');
  return {
    rank: finite(coin.rank), symbol: coin.symbol || 'UBI', rewardSymbol: coin.quote?.symbol || 'USDC',
    bondedAt: coin.graduatedAt || null, priceUsd: finite(coin.priceUsd), marketCapUsd: finite(coin.marketCapUsd),
    volume24hUsd: finite(coin.volume24hUsd), change24h: finite(coin.change24h),
    chart: Array.isArray(coin.chart) ? coin.chart.map((point) => finite(point.close)).filter((value): value is number => value !== null) : [],
    apr24h: finite(coin.yield?.apr24h), apy24h: finite(coin.yield?.apy24h), apr3d: finite(coin.yield?.apr3d),
    apy3d: finite(coin.yield?.apy3d), apr7d: finite(coin.yield?.apr7d), apy7d: finite(coin.yield?.apy7d),
    eligibleSupplyPct: finite(coin.yield?.eligibleSupplyPct), minHoldingUsd: finite(coin.yield?.minHoldingUsd),
    feeEntitlementPct: feeEntitlement(coin.yield?.note), holderCount: finite(coin.yield?.holderCount),
    paidLifetimeUsd: finite(coin.rewardsPaid?.usd), payoutCount: finite(coin.rewardsPaid?.payoutCount),
    lastPayoutAt: coin.rewardsPaid?.lastPayoutAt || null, marketAt: shared.marketAt || null,
    returnUpdatedAt: shared.enrichmentAt || null,
  };
}

export async function GET() {
  try {
    const response = await fetch(STONK_BOARD_URL, {
      cache: 'no-store',
      headers: { Accept: 'text/html', 'User-Agent': 'UBI Income Board / public data display' },
    });
    if (!response.ok) throw new Error(`Stonk Board returned ${response.status}`);
    const shared = extractObject(await response.text(), '"initialSharedCoin":');
    return Response.json(snapshotFrom(shared), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'The Stonk Board is temporarily unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
