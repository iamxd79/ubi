'use client';

import { useStonkfun } from './stonkfun-provider';
import { useStonkBoard } from './stonk-board-provider';
import { MINT, formatUsd, numberValue, potThreshold, potProgress, relativePayout } from '@/lib/stonkfun';
import { compactUsd, percent, STONK_BOARD_URL } from '@/lib/stonk-board';
import { trackEvent, trackOutbound } from '@/lib/analytics';

const count = (value: unknown) => {
  const n = numberValue(value);
  return n === null ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
};
const dollars = (value: unknown) => {
  const n = numberValue(value);
  return n === null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};

function bondedAge(date: string | null) {
  if (!date) return '—';
  const elapsed = Math.max(0, Date.now() - new Date(date).getTime());
  const days = Math.floor(elapsed / 86_400_000);
  return days > 365 ? `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m` : `${days}d`;
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const line = points.map((point, index) => `${(index / (points.length - 1)) * 100},${91 - ((point - min) / span) * 76}`).join(' ');
  return <svg className="income-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="24 hour price history" role="img"><polyline points={line} /></svg>;
}

export function IncomeBoard() {
  const { metrics, paths, now, live } = useStonkfun();
  const { snapshot, live: boardLive } = useStonkBoard();
  const threshold = potThreshold(metrics.marketCap);
  const progress = potProgress(metrics.waitingToDistribute, threshold);
  const dailyPer100 = snapshot?.apr3d === null || snapshot?.apr3d === undefined ? null : snapshot.apr3d / 365;

  return <section id="income" className="income-board" aria-labelledby="income-title">
    <h2 id="income-title">The <span>Income</span> Board</h2>
    <p className="income-intro">85% of trading fees on this 4% pool are paid to $UBI holders in USDC. Holders with at least $20 of $UBI receive payouts automatically. Fees collect in a pot and pay out when the pot reaches 0.1% of market cap for market caps between $125K and $25M.</p>
    <div className="income-composition">
      <div className="income-side income-side-left" aria-hidden="true"><img src="/income-board-elon.webp" alt="" loading="lazy" decoding="async" /></div>
      <div className="income-card">
        <div className="income-stats">
          <div className="income-stat"><h3>TOTAL PAID TO HOLDERS</h3><strong id="paid-to-holders" data-json-path={paths.paidToHolders}>{formatUsd(metrics.paidToHolders)}</strong></div>
          <div className="income-stat"><h3>NEXT BATCH, ACCUMULATING</h3><strong id="next-batch" data-json-path={paths.waitingToDistribute}>{dollars(metrics.waitingToDistribute)}</strong><div className="income-progress" role="progressbar" aria-label="Next payout pot" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress ?? undefined} aria-valuetext={progress === null ? 'Amount unavailable' : `${Math.round(progress)}%`}><span style={{ width: progress === null ? '0%' : `${progress}%` }} /></div><p className="income-threshold">{dollars(metrics.waitingToDistribute)} of ~<span id="pot-threshold" data-market-cap-path={paths.marketCap}>{formatUsd(threshold)}</span> threshold</p></div>
          <div className="income-stat"><h3>PAYOUTS SENT</h3><strong id="payouts-sent" data-json-path={paths.payouts}>{count(metrics.payouts)}</strong></div>
          <div className="income-stat"><h3>TOTAL HOLDERS</h3><strong id="total-holders" data-json-path={paths.holders}>{count(metrics.holders)}</strong></div>
        </div>

        <section className="income-yield" aria-labelledby="yield-title">
          <div className="income-yield-header"><div><h3 id="yield-title">MODELED HOLDER RETURN</h3><p>{snapshot ? `#${snapshot.rank ?? '—'} on The Stonk Board · bonded ${bondedAge(snapshot.bondedAt)}` : 'Loading independent return model…'}</p></div><a href={STONK_BOARD_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('yield_source_clicked', { location: 'income_board' })}>Methodology ↗</a></div>
          <div className="income-yield-grid">
            <div><span>24H LOOKBACK</span><strong>{percent(snapshot?.apr24h ?? null)} <small>APR</small></strong><p>{percent(snapshot?.apy24h ?? null)} APY</p></div>
            <div className="income-yield-feature"><span>3D LOOKBACK</span><strong>{percent(snapshot?.apr3d ?? null)} <small>APR</small></strong><p>{percent(snapshot?.apy3d ?? null)} APY · {dailyPer100 === null ? '—' : `$${dailyPer100.toFixed(2)} / $100 daily`}</p></div>
            <div><span>7D LOOKBACK</span><strong>{percent(snapshot?.apr7d ?? null)} <small>APR</small></strong><p>{percent(snapshot?.apy7d ?? null)} APY</p></div>
          </div>
          <p className="income-yield-note">Modeled from observed fees and eligible holdings. APY assumes daily reinvestment; it is not a forecast or guarantee.</p>
        </section>

        <section className="income-market" aria-label="UBI market snapshot">
          <div className="income-market-stat"><span>MARKET CAP</span><strong>{compactUsd(snapshot?.marketCapUsd ?? null)}</strong></div>
          <div className="income-market-stat"><span>VOLUME · 24H</span><strong>{compactUsd(snapshot?.volume24hUsd ?? null)}</strong></div>
          <div className="income-market-stat"><span>PRICE</span><strong>{compactUsd(snapshot?.priceUsd ?? null)}</strong></div>
          <div className="income-market-stat income-change"><span>24H CHANGE</span><strong className={(snapshot?.change24h ?? 0) >= 0 ? 'positive' : 'negative'}>{snapshot?.change24h === null || snapshot?.change24h === undefined ? '—' : `${snapshot.change24h >= 0 ? '+' : ''}${percent(snapshot.change24h)}`}</strong><Sparkline points={snapshot?.chart ?? []} /></div>
          <div className="income-market-stat"><span>BOARD LIFETIME PAID</span><strong>{compactUsd(snapshot?.paidLifetimeUsd ?? null)}</strong></div>
          <div className="income-market-stat"><span>ELIGIBLE SUPPLY</span><strong>{percent(snapshot?.eligibleSupplyPct ?? null)}</strong></div>
          <div className="income-market-stat"><span>MINIMUM HOLDING</span><strong>{compactUsd(snapshot?.minHoldingUsd ?? null)}</strong></div>
          <div className="income-market-stat"><span>FEE ENTITLEMENT</span><strong>{percent(snapshot?.feeEntitlementPct ?? null)}</strong></div>
        </section>

        <div className="income-status"><span className={live ? 'income-dot' : 'income-dot stale'} aria-label={live ? 'Live data' : 'Waiting for live data'} /><span>last payout <time id="last-payout" dateTime={typeof metrics.lastPayoutAt === 'string' ? metrics.lastPayoutAt : undefined} data-json-path={paths.lastPayoutAt}>{relativePayout(metrics.lastPayoutAt, now)}</time></span><span aria-hidden="true">·</span><span>{live ? 'live from' : 'last available from'} <a href={'https://www.stonkfun.xyz/token/' + MINT} target="_blank" rel="noreferrer" onClick={() => trackOutbound('payouts', 'income_board')}>stonkfun.xyz</a></span><span aria-hidden="true">·</span><span>{boardLive ? 'market model refreshed' : 'market model cached'} every 15m</span></div>
      </div>
      <div className="income-side income-side-right" aria-hidden="true"><img src="/income-board-trump.webp" alt="" loading="lazy" decoding="async" /></div>
    </div>
  </section>;
}