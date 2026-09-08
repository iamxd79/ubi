'use client';
import { useStonkfun } from './stonkfun-provider';
import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';

import { MINT, formatUsd } from '@/lib/stonkfun';

const trade='https://www.gg.xyz/post/1395c40f-9dca-4bbb-bf2c-2c3f2f623c34?ref=xd79';
const contract='Lyi47medADEVDd5hxJo1mbxhnBct841sFpcGRyHTuwp';
export function UbiHero(){
 const {metrics,paths}=useStonkfun();
 const [copied,setCopied]=useState(false);
 async function copyContract(){try{await navigator.clipboard.writeText(contract);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{}}
 return <>
  <header className="space-nav"><a href="#top" className="space-brand"><img src="/globe.webp" alt="" width={820} height={820} decoding="async"/><span>UNIVERSAL BASIC INCOME</span></a><nav aria-label="Main navigation"><a href="#lore">The Lore <ArrowUpRight aria-hidden="true"/></a><a href="#income">The Income <ArrowUpRight aria-hidden="true"/></a><a href="#record">The record <ArrowUpRight aria-hidden="true"/></a><a href={trade} className="buy" target="_blank" rel="noreferrer">Buy $UBI <ArrowUpRight aria-hidden="true"/></a></nav></header>
  <section className="space-hero" aria-label="Universal Basic Income">
   <div className="space-emblem"><img src="/globe.webp" alt="Universal Basic Income" width={820} height={820} fetchPriority="high" decoding="async"/></div>
   <h1>The idea is 229 years old</h1><p className="space-subtitle">now the distribution is onchain.</p>
   <h2>Hold <span>$UBI</span> to earn $USDC</h2>
   <a className="space-paid" href={'https://www.stonkfun.xyz/token/'+MINT} target="_blank" rel="noreferrer"><strong id="hero-paid-to-holders" data-json-path={paths.paidToHolders}>{formatUsd(metrics.paidToHolders)}</strong> already paid to holders</a>
   {Object.hasOwn(metrics,'waitingToDistribute')&&<p className="space-pot">Next pot <span id="waiting-to-distribute">{formatUsd(metrics.waitingToDistribute)}</span> accumulating</p>}
   <div className="space-ca"><span>CA</span><code>{contract}</code><button type="button" className="space-ca-copy" onClick={copyContract} aria-label="Copy $UBI contract">{copied?<Check aria-hidden="true"/>:<Copy aria-hidden="true"/>}<span>{copied?'Copied':'Copy'}</span></button></div>
   <div className="space-actions"><a href={trade} target="_blank" rel="noreferrer">Buy $UBI <ArrowUpRight aria-hidden="true"/></a><a href="https://dexscreener.com/solana/hmh9syen37waf4hnycymuaprv6xftptdb3mqmemnppsr" target="_blank" rel="noreferrer">Chart <ArrowUpRight aria-hidden="true"/></a></div>
  </section>
 </>;
}


