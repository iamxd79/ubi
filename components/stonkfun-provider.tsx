'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { MINT, fetchMetrics, mergeMetrics, type Metrics } from '@/lib/stonkfun';
const storageKey='ubi-stonkfun-v1:'+MINT;
const Context=createContext<{metrics:Metrics;paths:Record<string,string>;now:number;live:boolean}>({metrics:{},paths:{},now:0,live:false});
export function StonkfunProvider({children}:{children:ReactNode}){
 const [now,setNow]=useState(0);
 const [live,setLive]=useState(false);
 const [metrics,setMetrics]=useState<Metrics>({});
 const [paths,setPaths]=useState<Record<string,string>>({});
 const good=useRef<Metrics>({});
 useEffect(()=>{
  let stopped=false, busy=false; const controller=new AbortController();
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');good.current=mergeMetrics({},saved);setMetrics(good.current);}catch{/* Storage may be disabled. */}
  function apply(values:Metrics,newPaths:Record<string,string>){
   if(stopped)return; setLive(true); setNow(Date.now());
   setMetrics(previous=>mergeMetrics(previous,values)); setPaths(previous=>({...previous,...newPaths}));
   const valid=Object.fromEntries(Object.entries(values).filter(([,value])=>value!==null));
   good.current=mergeMetrics(good.current,valid);
   try{localStorage.setItem(storageKey,JSON.stringify(good.current));}catch{/* In-memory cache remains available. */}
  }
  async function refresh(){
   if(busy||stopped)return;busy=true; setNow(Date.now());
   try{
    let direct;
    try{direct=await fetchMetrics(fetch,controller.signal);apply(direct.values,direct.paths);}catch{if(controller.signal.aborted)return;}
    if(!direct || direct.partial){
     const response=await fetch('/api/stonkfun/token',{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(26000)]),cache:'no-store'});
     if(!response.ok)throw new Error('Proxy unavailable');
     const result=await response.json() as {values?:Metrics;paths?:Record<string,string>};
     if(!result || !result.values || !result.paths)throw new Error('Invalid proxy response');
     apply(result.values,result.paths);
    }
   }catch{if(!stopped){setLive(false);setMetrics(previous=>mergeMetrics(previous,good.current));}}
   finally{busy=false;}
  }
  void refresh();const timer=setInterval(()=>void refresh(),30000);
  return()=>{stopped=true;controller.abort();clearInterval(timer);};
 },[]);
 return <Context.Provider value={{metrics,paths,now,live}}>{children}</Context.Provider>;
}
export const useStonkfun=()=>useContext(Context);

