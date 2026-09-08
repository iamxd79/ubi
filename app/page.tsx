import { headers } from 'next/headers';
import { LinksHub } from '@/components/links-hub';
import { UbiSite } from '@/components/ubi-site';

export default async function Home(){
  const host=(await headers()).get('host')?.split(':')[0]?.toLowerCase();
  return host==='ubiszn.me'||host==='www.ubiszn.me'?<LinksHub/>:<UbiSite/>;
}
