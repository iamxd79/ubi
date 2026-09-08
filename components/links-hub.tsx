'use client';

import { ArrowUpRight, Check, Copy, ExternalLink, LineChart, Send, Sparkles, WalletCards } from 'lucide-react';
import { useState } from 'react';
import styles from './links-hub.module.css';

const contract='Lyi47medADEVDd5hxJo1mbxhnBct841sFpcGRyHTuwp';
const links={
  trade:'https://www.gg.xyz/post/1395c40f-9dca-4bbb-bf2c-2c3f2f623c34?ref=xd79',
  chart:'https://www.gg.xyz/tokens/solana/Lyi47medADEVDd5hxJo1mbxhnBct841sFpcGRyHTuwp',
  payouts:'https://www.stonkfun.xyz/token/Lyi47medADEVDd5hxJo1mbxhnBct841sFpcGRyHTuwp',
  x:'https://x.com/ubiszn',
  telegram:'https://t.me/ubiszn',
  site:'https://www.ubiszn.com',
};

export function LinksHub(){
  const [copied,setCopied]=useState(false);
  async function copyContract(){
    try{await navigator.clipboard.writeText(contract);setCopied(true);window.setTimeout(()=>setCopied(false),1800)}catch{}
  }
  return <main className={styles.hub}>
    <div className={styles.orbit} aria-hidden="true"/>
    <div className={styles.grid} aria-hidden="true"/>
    <section className={styles.shell} aria-label="$UBI links">
      <div className={styles.identity}>
        <div className={styles.portraitFrame}><img src="/ubi-pfp.png" alt="Universal Basic Income" width={1254} height={1254}/></div>
      </div>

      <nav className={styles.actions} aria-label="$UBI destinations">
        <a className={styles.primaryAction} href={links.trade} target="_blank" rel="noreferrer">
          <span className={styles.actionIcon}><WalletCards aria-hidden="true"/></span>
          <span><small>THE MARKET</small><strong>Trade $UBI</strong></span>
          <ArrowUpRight className={styles.arrow} aria-hidden="true"/>
        </a>
        <div className={styles.actionGrid}>
          <a className={styles.action} href={links.chart} target="_blank" rel="noreferrer">
            <LineChart aria-hidden="true"/><span><small>LIVE DATA</small><strong>Chart</strong></span><ArrowUpRight aria-hidden="true"/>
          </a>
          <a className={styles.action} href={links.payouts} target="_blank" rel="noreferrer">
            <Sparkles aria-hidden="true"/><span><small>STONKFUN</small><strong>Payouts</strong></span><ArrowUpRight aria-hidden="true"/>
          </a>
        </div>
        <a className={styles.loreAction} href={`${links.site}/#lore`}>
          <span>229 YEARS OF THE IDEA</span><strong>Enter the lore</strong><ArrowUpRight aria-hidden="true"/>
        </a>
      </nav>

      <section className={styles.socials} aria-label="Social links">
        <p>JOIN THE SIGNAL</p>
        <div>
          <a href={links.x} target="_blank" rel="noreferrer"><span className={styles.xMark}>𝕏</span><span><small>FOLLOW ON</small><strong>@ubiszn</strong></span><ExternalLink aria-hidden="true"/></a>
          <a href={links.telegram} target="_blank" rel="noreferrer"><Send aria-hidden="true"/><span><small>JOIN THE</small><strong>Telegram</strong></span><ExternalLink aria-hidden="true"/></a>
        </div>
      </section>

      <section className={styles.contract} aria-label="UBI contract address">
        <div><span>CA · SOLANA</span><code>{contract}</code></div>
        <button type="button" onClick={copyContract} aria-label="Copy UBI contract address">{copied?<Check aria-hidden="true"/>:<Copy aria-hidden="true"/>}<span>{copied?'COPIED':'COPY'}</span></button>
      </section>

      <footer><span>THE DISTRIBUTION IS ONCHAIN.</span><a href={links.site}>www.ubiszn.com <ArrowUpRight aria-hidden="true"/></a></footer>
    </section>
  </main>;
}


