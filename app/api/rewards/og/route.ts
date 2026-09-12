import { getHolderSnapshot, isWalletAddress, formatToken, formatUsdValue, shortenWallet } from '@/lib/holder';

function escape(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);
}

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get('wallet')?.trim() || '';
  const valid = isWalletAddress(wallet);
  let balance = '—', value = '—', status = 'UNAVAILABLE';
  if (valid) {
    try {
      const data = await getHolderSnapshot(wallet);
      balance = formatToken(data.balance);
      value = formatUsdValue(data.positionValueUsd);
      status = data.eligible === true ? 'ELIGIBLE' : data.eligible === false ? 'NOT ELIGIBLE' : 'UNAVAILABLE';
    } catch { /* The branded card remains available even if public RPC is slow. */ }
  }
  const holder = valid ? shortenWallet(wallet) : 'UBI HOLDER';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#041a35"/><stop offset="1" stop-color="#010916"/></linearGradient><radialGradient id="glow"><stop stop-color="#1ed8ff" stop-opacity=".45"/><stop offset="1" stop-color="#1ed8ff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1080" cy="90" r="320" fill="url(#glow)"/><rect x="55" y="52" width="1090" height="526" rx="26" fill="#05294b" stroke="#41d8ff" stroke-width="2"/><text x="95" y="115" fill="#73dcff" font-family="Arial" font-size="20" letter-spacing="4">$UBI HOLDER CARD</text><text x="95" y="190" fill="#fff" font-family="Arial" font-size="48" font-weight="700">' + escape(holder) + '</text><text x="95" y="230" fill="#b9cde2" font-family="Arial" font-size="19">Live public on-chain position</text><line x1="95" y1="275" x2="1105" y2="275" stroke="#5bd5ff" stroke-opacity=".34"/><text x="95" y="335" fill="#6cdcff" font-family="Arial" font-size="16" letter-spacing="2">CURRENT $UBI BALANCE</text><text x="95" y="390" fill="#fff" font-family="Arial" font-size="38" font-weight="700">' + escape(balance) + '</text><text x="465" y="335" fill="#6cdcff" font-family="Arial" font-size="16" letter-spacing="2">POSITION VALUE</text><text x="465" y="390" fill="#fff" font-family="Arial" font-size="38" font-weight="700">' + escape(value) + '</text><text x="825" y="335" fill="#6cdcff" font-family="Arial" font-size="16" letter-spacing="2">HOLDER STATUS</text><text x="825" y="390" fill="#42f2b0" font-family="Arial" font-size="38" font-weight="700">' + escape(status) + '</text><text x="95" y="520" fill="#b9cde2" font-family="Arial" font-size="18">UBISZN.COM · $UBI HOLDER REWARDS</text></svg>';
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}