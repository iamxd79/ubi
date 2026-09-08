export const MINT = 'Lyi47medADEVDd5hxJo1mbxhnBct841sFpcGRyHTuwp';
export const API = 'https://www.stonkfun.xyz/api/public/v1';
export const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const aliases = {
  paidToHolders: ['paidToHolders', 'totalPaidUsd', 'paidUsd', 'rewardsPaidUsd', 'distributedUsd'],
  waitingToDistribute: ['waitingToDistribute', 'pendingUsd', 'potUsd', 'accumulatingUsd'],
  marketCap: ['marketCap', 'marketCapUsd'], price: ['price', 'priceUsd'],
  volume24h: ['volume24h', 'volume24hUsd'], fdv: ['fdv', 'fdvUsd'],
  lastPayoutAt: ['lastPayoutAt', 'lastDistributionAt'],
  holders: ['holders', 'holderCount', 'totalHolders'],
  payouts: ['distributions', 'payoutCount', 'paidWallets', 'holderPayouts'],
} as const;
export type Metrics = Partial<Record<keyof typeof aliases, number | string | null>>;
type Obj = Record<string, unknown>;
const object = (v: unknown): Obj => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {};
export function numberValue(v: unknown): number | null {
  if ((typeof v !== 'number' && typeof v !== 'string') || v === '' || (typeof v === 'string' && !v.trim())) return null;
  const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : null;
}
export function normalize(payload: unknown, kind: 'token' | 'rewards' | 'detail') {
  const root = object(payload), data = object(root.data ?? root);
  let record: Obj, path: string;
  if (kind === 'rewards') {
    const list = Array.isArray(data.launches) ? data.launches : Array.isArray(data.tokens) ? data.tokens : Array.isArray(root.data) ? root.data : Array.isArray(payload) ? payload : [];
    const index = list.findIndex(v => object(v).mint === MINT);
    if (index < 0) return {values: {} as Metrics, paths: {} as Record<string,string>};
    record = object(list[index]); path = Array.isArray(data.launches) ? `data.launches[${index}]` : `data[${index}]`;
  } else {record = object(data.token ?? data); path = data.token ? 'data.token' : 'data';}
  if (record.mint !== MINT) return {values: {} as Metrics, paths: {} as Record<string,string>};
  const containers = [[record,path],[object(record.market),path+'.market'],[object(record.rewards),path+'.rewards']] as const;
  const values: Metrics = {}, paths: Record<string,string> = {};
  for (const [key,names] of Object.entries(aliases)) {
    outer: for (const name of names) for (const [container,base] of containers) {
      if (!Object.hasOwn(container,name)) continue;
      const raw = container[name];
      const value = key === 'lastPayoutAt' ? (typeof raw === 'string' && Number.isFinite(Date.parse(raw)) ? raw : null) : numberValue(raw);
      // Explicit null is unknown. Malformed fields never replace a last good number.
      if (value !== null || raw === null) {values[key as keyof Metrics] = value; paths[key] = base+'.'+name; break outer;}
    }
  }
  // These documented fields are denominated in the quote token, not $UBI.
  // Only the canonical USDC quote mint can be displayed as USD here.
  if (object(record.quote).mint === USDC) {
    for (const [key,name] of [['paidToHolders','distributedTokens'],['waitingToDistribute','undistributedTokens']] as const) {
      if (Object.hasOwn(values,key)) continue;
      for (const [container,base] of containers) if (Object.hasOwn(container,name)) {
        const raw=container[name], n=numberValue(raw);
        if(n!==null || raw===null){values[key]=n; paths[key]=base+'.'+name;break;}
      }
    }
  }
  return {values,paths};
}
export function mergeMetrics(previous: Metrics, incoming: Metrics): Metrics {
  const next={...previous};
  for(const key of Object.keys(aliases) as (keyof Metrics)[]) if(Object.hasOwn(incoming,key)) {
    const v=incoming[key];
    if(v===null || (key==='lastPayoutAt' ? typeof v==='string' && Number.isFinite(Date.parse(v)) : numberValue(v)!==null)) next[key]=v;
  }
  return next;
}
export function formatUsd(value: unknown) {
  const n=numberValue(value); return n===null ? '—' : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:n>=1000?0:2,maximumFractionDigits:n>=1000?0:2}).format(n);
}
export function potThreshold(value: unknown) {
  const n=numberValue(value);
  if(n===null)return null;
  if(n<50000)return 50;
  if(n<100000)return 200;
  if(n<125000)return 250;
  if(n<25000000)return n*.001;
  return 50000;
}
export function potProgress(waiting: unknown, threshold: unknown) {
  const w=numberValue(waiting),t=numberValue(threshold);
  return w===null||t===null||t<=0?null:Math.min(100,w/t*100);
}
export function relativePayout(value: unknown, now: number) {
  if(typeof value!=='string'||!Number.isFinite(Date.parse(value))||!now)return '—';
  const seconds=Math.max(0,Math.floor((now-Date.parse(value))/1000));
  if(seconds<60)return 'just now';
  if(seconds<3600)return `${Math.floor(seconds/60)}m ago`;
  if(seconds<86400)return `${Math.floor(seconds/3600)}h ago`;
  return `${Math.floor(seconds/86400)}d ago`;
}
export async function fetchMetrics(fetcher: typeof fetch = fetch, signal?: AbortSignal) {
  let values: Metrics={}, paths: Record<string,string>={}, failures=0, successes=0;
  // Keep endpoint order; the detail endpoint supplements the documented pending pot.
  for(const [endpoint,kind] of [[`/tokens/${MINT}`,'token'],['/rewards','rewards'],[`/tokens/${MINT}/rewards`,'detail']] as const){
    if(signal?.aborted) throw new DOMException('Aborted','AbortError');
    try{
      const response=await fetcher(API+endpoint,{signal:signal ? AbortSignal.any([signal,AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),cache:'no-store',headers:{Accept:'application/json'}});
      if(!response.ok) throw new Error('StonkFun HTTP '+response.status);
      const result=normalize(await response.json(),kind);successes++;
      for(const key of Object.keys(result.values) as (keyof Metrics)[]) if(!Object.hasOwn(values,key)) {values[key]=result.values[key];paths[key]=endpoint+': '+result.paths[key];}
    }catch(error){if(signal?.aborted) throw error;failures++;}
  }
  if(!successes || !Object.keys(values).length) throw new Error('StonkFun data unavailable');
  return {values,paths,partial:failures>0};
}
