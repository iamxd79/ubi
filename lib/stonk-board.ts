export const STONK_BOARD_URL = 'https://thestonkboard.com/coin/Lyi47medADEVDd5hxJo1mbxhnBct841sFpcGRyHTuwp';

export type StonkBoardSnapshot = {
  rank: number | null;
  symbol: string;
  rewardSymbol: string;
  bondedAt: string | null;
  priceUsd: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  change24h: number | null;
  apr24h: number | null;
  apy24h: number | null;
  apr3d: number | null;
  apy3d: number | null;
  apr7d: number | null;
  apy7d: number | null;
  eligibleSupplyPct: number | null;
  minHoldingUsd: number | null;
};

export const compactUsd = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 2 : 5,
  }).format(value);
};

export const percent = (value: number | null, digits = 1) => {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toLocaleString('en-US', { maximumFractionDigits: digits })}%`;
};
