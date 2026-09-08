'use client';
import { useStonkfun } from './stonkfun-provider';
import { MINT, formatUsd, numberValue, potThreshold, potProgress, relativePayout } from '@/lib/stonkfun';
import { trackOutbound } from '@/lib/analytics';
const count=(value:unknown)=>{const n=numberValue(value);return n===null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n)};
const dollars=(value:unknown)=>{const n=numberValue(value);return n===null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(n)};
export function IncomeBoard(){
 const {metrics,paths,now,live}=useStonkfun();
 const threshold=potThreshold(metrics.marketCap), progress=potProgress(metrics.waitingToDistribute,threshold);
 return <section id="income" className="income-board" aria-labelledby="income-title">
  <h2 id="income-title">The <span>Income</span> Board</h2>
  <p className="income-intro">85% of trading fees on this 4% pool are paid to $UBI holders in USDC. Holders with at least $20 of $UBI receive payouts automatically. Fees collect in a pot and pay out when the pot reaches 0.1% of market cap for market caps between $125K and $25M.</p>
  <div className="income-composition">
   <div className="income-side income-side-left" aria-hidden="true"><img src="/income-board-elon.webp" alt="" loading="lazy" decoding="async"/></div>
   <div className="income-card">
    <div className="income-stats">
     <div className="income-stat"><h3>TOTAL PAID TO HOLDERS</h3><strong id="paid-to-holders" data-json-path={paths.paidToHolders}>{formatUsd(metrics.paidToHolders)}</strong></div>
     <div className="income-stat"><h3>NEXT BATCH, ACCUMULATING</h3><strong id="next-batch" data-json-path={paths.waitingToDistribute}>{dollars(metrics.waitingToDistribute)}</strong>
      <div className="income-progress" role="progressbar" aria-label="Next payout pot" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress??undefined} aria-valuetext={progress===null?'Amount unavailable':`${Math.round(progress)}%`}><span style={{width:progress===null?'0%':`${progress}%`}}/></div>
      <p className="income-threshold">{dollars(metrics.waitingToDistribute)} of ~<span id="pot-threshold" data-market-cap-path={paths.marketCap}>{formatUsd(threshold)}</span> threshold</p>
     </div>
     <div className="income-stat"><h3>PAYOUTS SENT</h3><strong id="payouts-sent" data-json-path={paths.payouts}>{count(metrics.payouts)}</strong></div>
     <div className="income-stat"><h3>TOTAL HOLDERS</h3><strong id="total-holders" data-json-path={paths.holders}>{count(metrics.holders)}</strong></div>
    </div>
    <div className="income-status"><span className={live?'income-dot':'income-dot stale'} aria-label={live?'Live data':'Waiting for live data'}/><span>last payout <time id="last-payout" dateTime={typeof metrics.lastPayoutAt==='string'?metrics.lastPayoutAt:undefined} data-json-path={paths.lastPayoutAt}>{relativePayout(metrics.lastPayoutAt,now)}</time></span><span aria-hidden="true">·</span><span>{live?'live from':'last available from'} <a href={'https://www.stonkfun.xyz/token/'+MINT} target="_blank" rel="noreferrer" onClick={()=>trackOutbound('payouts','income_board')}>stonkfun.xyz</a></span><span aria-hidden="true">·</span><span>refreshes every 30s</span></div>
   </div>
   <div className="income-side income-side-right" aria-hidden="true"><img src="/income-board-trump.webp" alt="" loading="lazy" decoding="async"/></div>
  </div>
 </section>;
}
