import { ImageResponse } from '@vercel/og';
import { getHolderSnapshot, isWalletAddress, formatToken, formatUsdValue, shortenWallet } from '@/lib/holder';

export const runtime = 'edge';

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
    } catch { /* The branded preview remains available when a public RPC is slow. */ }
  }

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 55, color: 'white', background: 'linear-gradient(135deg, #041a35, #010916)' }}>
      <div style={{ position: 'absolute', right: -120, top: -120, width: 470, height: 470, borderRadius: 9999, background: 'radial-gradient(circle, rgba(30,216,255,.42), rgba(30,216,255,0))' }} />
      <div style={{ display: 'flex', flexDirection: 'column', border: '2px solid #41d8ff', borderRadius: 26, padding: 40, flex: 1, background: 'linear-gradient(145deg, #05294b, #02172e)' }}>
        <div style={{ color: '#73dcff', fontSize: 19, letterSpacing: 4 }}>$UBI HOLDER CARD</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 25 }}>{valid ? shortenWallet(wallet) : 'UBI HOLDER'}</div>
        <div style={{ color: '#b9cde2', fontSize: 20, marginTop: 8 }}>Live public on-chain position</div>
        <div style={{ height: 1, background: 'rgba(91,213,255,.34)', marginTop: 34, marginBottom: 38 }} />
        <div style={{ display: 'flex', gap: 38 }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 315 }}><div style={{ color: '#6cdcff', fontSize: 15, letterSpacing: 2 }}>CURRENT $UBI BALANCE</div><div style={{ fontSize: 35, fontWeight: 700, marginTop: 15 }}>{balance}</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', width: 295 }}><div style={{ color: '#6cdcff', fontSize: 15, letterSpacing: 2 }}>POSITION VALUE</div><div style={{ fontSize: 35, fontWeight: 700, marginTop: 15 }}>{value}</div></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ color: '#6cdcff', fontSize: 15, letterSpacing: 2 }}>HOLDER STATUS</div><div style={{ color: '#42f2b0', fontSize: 35, fontWeight: 700, marginTop: 15 }}>{status}</div></div>
        </div>
        <div style={{ color: '#b9cde2', fontSize: 17, marginTop: 'auto' }}>UBISZN.COM · $UBI HOLDER REWARDS</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}