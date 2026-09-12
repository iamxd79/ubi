import type { Metadata } from 'next';
import { HolderRewardsChecker } from '@/components/holder-rewards-checker';
import { isWalletAddress, shortenWallet } from '@/lib/holder';

type Props = { params: Promise<{ wallet: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wallet = decodeURIComponent((await params).wallet || '');
  const holder = isWalletAddress(wallet) ? shortenWallet(wallet) : 'UBI Holder';
  const image = '/api/rewards/og?wallet=' + encodeURIComponent(wallet);
  return {
    title: holder + ' | $UBI Holder Rewards',
    description: 'Live $UBI holder status and shareable rewards card.',
    openGraph: { title: holder + ' | $UBI Holder Rewards', description: 'Live $UBI holder status and shareable rewards card.', images: [{ url: image, width: 1200, height: 630, type: 'image/png' }] },
    twitter: { card: 'summary_large_image', title: holder + ' | $UBI Holder Rewards', description: 'Live $UBI holder status and shareable rewards card.', images: [image] },
  };
}

export default async function RewardsPage({ params }: Props) {
  const wallet = decodeURIComponent((await params).wallet || '');
  return <main className="rewards-page"><a className="rewards-brand" href="/"><img src="/globe.webp" alt="" width={820} height={820} /><span>UNIVERSAL<br />BASIC INCOME</span></a><HolderRewardsChecker initialWallet={wallet} standalone /></main>;
}