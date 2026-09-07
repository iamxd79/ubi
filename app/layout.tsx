import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'$UBI — An old idea. A new distribution.',description:'Explore 229 years of universal basic income history. Discover $UBI on Solana and follow the public StonkFun payout record.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
