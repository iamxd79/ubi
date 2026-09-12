'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CalendarDays, Check, Clipboard, Download, ExternalLink, LoaderCircle, Search, Share2, WalletCards } from 'lucide-react';
import { formatToken, formatUsdValue, isWalletAddress, shortenWallet, type HolderSnapshot } from '@/lib/holder';
import { trackEvent } from '@/lib/analytics';

type Props = { initialWallet?: string; standalone?: boolean };

function status(snapshot: HolderSnapshot) {
  if (snapshot.eligible === true) return 'ELIGIBLE';
  if (snapshot.eligible === false) return snapshot.balance === 0 ? 'NOT HOLDING' : 'NOT ELIGIBLE';
  return 'UNAVAILABLE';
}
function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}
function formatDays(value: number | null) {
  return value === null ? '—' : value === 1 ? '1 day' : value + ' days';
}
function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(value) + '%';
}
function formatShare(data: HolderSnapshot) {
  const share = formatPercent(data.feeEntitlementPct);
  return data.holderRank === null ? share : share + ' · #' + data.holderRank;
}

function cardSvg(data: HolderSnapshot) {
  const line = (label: string, value: string, x: number, y: number) => '<text x="' + x + '" y="' + y + '" fill="#66d8ff" font-size="18" font-family="Arial" letter-spacing="2">' + label + '</text><text x="' + x + '" y="' + (y + 46) + '" fill="#fff" font-size="34" font-family="Arial" font-weight="700">' + value + '</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#041b36"/><stop offset="1" stop-color="#010b1c"/></linearGradient><radialGradient id="r"><stop stop-color="#0ccfff" stop-opacity=".3"/><stop offset="1" stop-color="#0ccfff" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1400" cy="130" r="420" fill="url(#r)"/><rect x="70" y="70" width="1460" height="760" rx="32" fill="#05294c" stroke="#30d4ff" stroke-width="3"/><text x="120" y="145" fill="#74dfff" font-size="23" font-family="Arial" letter-spacing="5">$UBI HOLDER CARD</text><text x="120" y="220" fill="#fff" font-size="48" font-family="Arial" font-weight="700">' + shortenWallet(data.wallet) + '</text><text x="120" y="262" fill="#b8cbe0" font-size="23" font-family="Arial">Personal on-chain UBI position</text><line x1="120" y1="305" x2="1480" y2="305" stroke="#58c8f4" stroke-opacity=".35"/>' + line('CURRENT $UBI BALANCE', formatToken(data.balance), 120, 370) + line('POSITION VALUE', formatUsdValue(data.positionValueUsd), 590, 370) + line('STATUS', status(data), 1060, 370) + '<rect x="120" y="500" width="1360" height="210" rx="18" fill="#03182f" stroke="#54c9ef" stroke-opacity=".35"/>' + line('OBSERVED USDC RECEIVED', formatUsdValue(data.totalEarnedUsd), 160, 555) + line('EST. NEXT PAYOUT', formatUsdValue(data.nextPayoutUsd), 640, 555) + line('HOLDING HISTORY', formatDays(data.holdingDuration), 1120, 555) + '<text x="120" y="775" fill="#b8cbe0" font-size="19" font-family="Arial">UBISZN.COM · Personal public on-chain data</text></svg>';
}
async function downloadCard(data: HolderSnapshot) {
  const image = new Image();
  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cardSvg(data));
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Card export failed.')); });
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Card export failed.');
  context.drawImage(image, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Card export failed.');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ubi-holder-card-' + data.wallet.slice(0, 6) + '.png';
  link.click();
  URL.revokeObjectURL(link.href);
}

function HolderCard({ data }: { data: HolderSnapshot }) {
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const link = typeof window === 'undefined' ? '/rewards/' + data.wallet : window.location.origin + '/rewards/' + data.wallet;
  const earned = formatUsdValue(data.totalEarnedUsd);
  const message = data.totalEarnedUsd === null ? 'My $UBI holder card: ' + formatToken(data.balance) + ' $UBI · ' + status(data) + ' for holder rewards. Check yours: ' + link : 'My $UBI holder card shows ' + earned + ' in observed USDC payouts. Holding ' + formatToken(data.balance) + ' $UBI and currently ' + status(data).toLowerCase() + ' for holder rewards. Check yours: ' + link;

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    trackEvent('holder_card_link_copied', { status: status(data) });
    window.setTimeout(() => setCopied(false), 1800);
  }
  async function exportCard() {
    try {
      await downloadCard(data);
      setDownloadError(false);
      trackEvent('holder_card_downloaded', { status: status(data) });
    } catch { setDownloadError(true); }
  }

  return <div className="holder-card-enter">
    <article className="holder-card" aria-label="UBI holder rewards card">
      <header className="holder-card-head"><div><span className="holder-kicker">$UBI HOLDER CARD</span><strong>{shortenWallet(data.wallet)}</strong></div><span className={'holder-status ' + status(data).toLowerCase().replace(' ', '-')}>{status(data)}</span></header>
      <div className="holder-primary">
        <div><span>CURRENT $UBI BALANCE</span><strong>{formatToken(data.balance)}</strong></div>
        <div><span>POSITION VALUE</span><strong>{formatUsdValue(data.positionValueUsd)}</strong></div>
        <div><span>OBSERVED USDC RECEIVED</span><strong>{formatUsdValue(data.totalEarnedUsd)}</strong></div>
        <div><span>EST. NEXT PAYOUT</span><strong>{formatUsdValue(data.nextPayoutUsd)}</strong></div>
        <div><span>HOLDING HISTORY</span><strong>{formatDays(data.holdingDuration)}</strong></div>
      </div>
      <div className="holder-secondary">
        <div><span><WalletCards aria-hidden="true" />HOLDER ID</span><strong>{shortenWallet(data.wallet)}</strong></div>
        <div><span><Check aria-hidden="true" />PAYOUTS OBSERVED</span><strong>{data.payoutCount ?? '—'}</strong></div>
        <div><span><Clipboard aria-hidden="true" />EST. PENDING SHARE</span><strong>{formatUsdValue(data.unpaidRewardsUsd)}</strong></div>
        <div><span><CalendarDays aria-hidden="true" />FIRST $UBI ACTIVITY</span><strong>{formatDate(data.firstDetectedAt)}</strong></div>
        <div><span><CalendarDays aria-hidden="true" />LAST STONKFUN PAYOUT</span><strong>{formatDate(data.lastPayoutAt)}</strong></div>
        <div><span>SUPPLY SHARE · RANK</span><strong>{formatShare(data)}</strong></div>
      </div>
      <p className="holder-disclaimer">Personal card only. USDC received is reconciled from transfers signed by StonkFun’s public payout authority. The pending share and next payout are estimates from this wallet’s current $UBI share, not a guarantee.</p>
    </article>
    <div className="holder-actions">
      <a href={'https://x.com/intent/post?text=' + encodeURIComponent(message)} target="_blank" rel="noreferrer" onClick={() => trackEvent('holder_card_shared_x', { status: status(data) })}><Share2 size={18} />Share on X</a>
      <button type="button" onClick={() => void copyLink()}><Clipboard size={18} />{copied ? 'Copied' : 'Copy Card Link'}</button>
      <button type="button" onClick={() => void exportCard()}><Download size={18} />Download Card</button>
    </div>
    {downloadError && <p className="holder-error" role="status">Could not export the card. Try again.</p>}
  </div>;
}

export function HolderRewardsChecker({ initialWallet, standalone = false }: Props) {
  const [wallet, setWallet] = useState(initialWallet || '');
  const [data, setData] = useState<HolderSnapshot | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function lookup(address: string) {
    const value = address.trim();
    if (!isWalletAddress(value)) {
      setData(null);
      setState('error');
      setMessage('Enter a valid Solana wallet address.');
      return;
    }
    setState('loading');
    setData(null);
    setMessage('');
    try {
      const response = await fetch('/api/rewards/holder?wallet=' + encodeURIComponent(value), { cache: 'no-store' });
      const result = await response.json() as HolderSnapshot & { error?: string };
      if (!response.ok || result.error) throw new Error(result.error || 'Holder data is unavailable.');
      setData(result);
      setState('idle');
      const path = '/rewards/' + value;
      if (!standalone) window.history.replaceState({}, '', path);
      trackEvent('holder_card_generated', { eligible: result.eligible === true, has_balance: (result.balance || 0) > 0, observed_payouts: result.payoutCount || 0 });
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Holder data is unavailable.');
    }
  }
  useEffect(() => {
    if (initialWallet) void lookup(initialWallet);
  }, [initialWallet]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookup(wallet);
  }

  return <section id="rewards" className={'holder-rewards ' + (standalone ? 'holder-standalone' : '')} aria-labelledby="rewards-title">
    <div className="holder-checker-top"><div><span className="holder-eyebrow">HOLDER REWARDS <Search size={13} aria-hidden="true" /></span><h2 id="rewards-title">Check Your <em>$UBI Rewards</em></h2><p>Enter a Solana wallet address to check your $UBI holder status and generate a shareable card.</p></div></div>
    <form className="holder-form" onSubmit={submit}>
      <label><WalletCards size={19} aria-hidden="true" /><input value={wallet} onChange={(event) => setWallet(event.target.value)} placeholder="Enter your Solana wallet address" autoCapitalize="none" autoCorrect="off" spellCheck="false" /></label>
      <button type="submit" disabled={state === 'loading'}>{state === 'loading' ? <><LoaderCircle className="spin" size={18} />Checking…</> : <>Generate Holder Card <ExternalLink size={18} /></>}</button>
    </form>
    {state === 'error' && <p className="holder-error" role="status">{message}</p>}
    {state === 'loading' && <div className="holder-skeleton" aria-label="Loading holder data"><i /><i /><i /><i /><i /></div>}
    {data && <HolderCard data={data} />}
    {!data && state === 'idle' && <div className="holder-empty"><WalletCards size={24} aria-hidden="true" /><span>Your private wallet is never connected. This checker only reads public on-chain token data.</span></div>}
  </section>;
}
