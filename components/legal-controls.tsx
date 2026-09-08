'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const documents = [
  { label: 'Disclaimer', title: 'Disclaimer', paragraphs: [
    'Last updated: September 2026',
    'This website provides information about $UBI, its community, token mechanics, trading activity, and associated payout mechanisms.',
    'Nothing on this website constitutes financial, investment, legal, accounting, or tax advice. $UBI is a crypto asset. Crypto assets can be highly volatile and may lose some or all of their value. Purchasing, holding, or trading $UBI involves risk.',
    'Any references to income, rewards, trading fees, USDC payouts, historical payouts, market capitalization, or future distributions are provided for informational purposes only. Past payouts do not guarantee future payouts.',
    'Payout amounts and frequency may depend on trading volume, token price, market capitalization, smart-contract rules, platform mechanics, liquidity, eligibility requirements, and other market conditions.',
    'Users should independently verify all information before interacting with $UBI or related smart contracts. The website may display data obtained from third-party platforms; this data may be delayed, incomplete, or inaccurate.',
    'Public figures, historical figures, memes, images, and cultural references appearing on the website are used for parody, commentary, education, or entertainment. Their appearance does not indicate sponsorship, endorsement, partnership, affiliation, or involvement with $UBI.',
    '$UBI is not a government program, government-issued currency, guaranteed income program, bank deposit, security deposit, or savings product.',
    'By using this website, you acknowledge that you are responsible for your own decisions and for complying with the laws applicable in your jurisdiction.',
  ] },
  { label: 'Terms', title: 'Terms of Use', paragraphs: [
    'Last updated: September 2026',
    'By accessing this website, you agree to these Terms of Use. The website is provided for informational and entertainment purposes.',
    'You are responsible for evaluating the risks associated with purchasing, holding, selling, or otherwise interacting with $UBI. Nothing on the website represents a promise of profit, return, income, or future value.',
    'You must not use this website for unlawful activity, fraud, market manipulation, exploitation, malicious attacks, or attempts to interfere with the website or associated infrastructure.',
    'The website may contain links to third-party platforms, decentralized exchanges, block explorers, analytics providers, social networks, and other services. Those services operate independently. We are not responsible for their availability, content, security, fees, transactions, or policies.',
    'Smart contracts and blockchain transactions may be irreversible. You are responsible for verifying wallet addresses, token contract addresses, transaction details, slippage, fees, and network conditions before approving any transaction.',
    'The website may be updated, modified, suspended, or discontinued at any time. Information displayed on the website may also change as token mechanics, market conditions, integrations, or third-party services evolve.',
    'To the maximum extent permitted by law, the website and its contributors are not responsible for losses resulting from trading, token price movements, smart-contract failures, wallet compromise, network failures, third-party services, inaccurate data, or other risks associated with blockchain technology.',
  ] },
  { label: 'Privacy', title: 'Privacy', paragraphs: [
    'Last updated: September 2026',
    'We aim to collect as little personal information as reasonably necessary. Simply visiting the website does not require you to create an account or provide your name, email address, or other personal information.',
    'The website may automatically receive basic technical information such as browser type, device type, approximate location derived from IP address, pages visited, referral source, and basic usage information. This information may be used for security, performance monitoring, analytics, debugging, and improving the website.',
    'If the website connects to third-party services such as analytics providers, social platforms, decentralized exchanges, chart providers, or blockchain explorers, those services may process information under their own privacy policies.',
    'Connecting a crypto wallet may expose your public wallet address and publicly available blockchain activity. Blockchain information is generally public and cannot be deleted by this website.',
    'We do not sell personal information. We do not intentionally collect sensitive personal information through this website.',
    'Where applicable, you may have rights concerning personal information under local privacy laws, including rights of access, correction, deletion, restriction, or objection.',
    'Privacy contact: hello@ubiszn.com',
  ] },
  { label: 'Cookies', title: 'Cookies', paragraphs: [
    'Last updated: September 2026',
    'This website may use cookies and similar browser technologies to operate correctly, remember preferences, improve performance, and understand how visitors use the website.',
    'Essential browser storage may be used for website functionality and basic preferences. This site does not use advertising or retargeting trackers.',
    'If analytics tools, advertising, retargeting, or social-media tracking are added later, this Cookie Policy and consent system will be updated before those technologies are enabled.',
    'You can control or delete cookies through your browser settings. Disabling certain cookies may affect parts of the website.',
  ] },
] as const;

export function LegalControls() {
  const [showNotice, setShowNotice] = useState(false);
  useEffect(() => setShowNotice(window.localStorage.getItem('ubi-cookie-notice') !== 'seen'), []);
  function dismissNotice() { window.localStorage.setItem('ubi-cookie-notice', 'seen'); setShowNotice(false); }

  return <>
    <section className="legal-row" aria-label="Legal information">
      {documents.map((document) => <Dialog key={document.label}>
        <DialogTrigger className="legal-link">{document.label}</DialogTrigger>
        <DialogContent className="legal-dialog">
          <DialogTitle className="legal-title">{document.title}</DialogTitle>
          <DialogDescription className="legal-copy">{document.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</DialogDescription>
          <DialogFooter showCloseButton className="legal-dialog-footer" />
        </DialogContent>
      </Dialog>)}
    </section>
    {showNotice && <aside className="cookie-notice" aria-label="Cookie notice"><div><strong>Cookies, but chill.</strong><p>We only use essential browser storage needed to keep the site working. No ad tracking.</p></div><button onClick={dismissNotice}>Got it</button></aside>}
  </>;
}
