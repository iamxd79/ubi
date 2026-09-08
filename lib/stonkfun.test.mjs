import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MINT, USDC, normalize, mergeMetrics, formatUsd, potThreshold, potProgress, relativePayout, fetchMetrics } from './stonkfun.ts';
test('selects this mint, never another token or global total',()=>{
 const result=normalize({data:{paidToHolders:999999,launches:[{mint:'other',distributedTokens:999},{mint:MINT,quote:{mint:USDC},distributedTokens:78454.469838}]}},'rewards');
 assert.equal(result.values.paidToHolders,78454.469838);assert.equal(result.paths.paidToHolders,'data.launches[1].distributedTokens');
});
test('quote token totals require canonical USDC',()=>{
 assert.equal(normalize({data:{mint:MINT,quote:{symbol:'USDC',mint:'other'},rewards:{distributedTokens:100}}},'detail').values.paidToHolders,undefined);
});
test('aliases win, null stays unknown, missing and malformed do not become zero',()=>{
 assert.equal(normalize({data:{mint:MINT,paidToHolders:12,totalPaidUsd:99}},'token').values.paidToHolders,12);
 assert.equal(normalize({data:{mint:MINT,paidToHolders:null,totalPaidUsd:99}},'token').values.paidToHolders,null);
 assert.deepEqual(mergeMetrics({paidToHolders:100},{price:2}),{paidToHolders:100,price:2});
 assert.equal(normalize({data:{mint:MINT,paidToHolders:''}},'token').values.paidToHolders,undefined);
 assert.equal(normalize({data:{mint:'wrong',paidToHolders:50}},'token').values.paidToHolders,undefined);
 assert.equal(formatUsd(null),'—');assert.equal(formatUsd(undefined),'—');assert.equal(formatUsd(''),'—');assert.equal(formatUsd(0),'$0.00');assert.equal(formatUsd(68480.4),'$68,480');
});
test('extracts market and quote-denominated pending pot without conversion',()=>{
 assert.equal(normalize({data:{token:{mint:MINT,market:{marketCapUsd:50000}}}},'token').values.marketCap,50000);
 assert.equal(normalize({data:{mint:MINT,quote:{mint:USDC},rewards:{undistributedTokens:43.69}}},'detail').values.waitingToDistribute,43.69);
});
test('fetches in order and survives one failed endpoint',async()=>{
 const calls=[];
 const mock=async(url)=>{calls.push(String(url));if(calls.length===1)throw new Error('Network');return Response.json(calls.length===2?{data:{launches:[{mint:MINT,quote:{mint:USDC},distributedTokens:55}]}}:{data:{mint:MINT,quote:{mint:USDC},rewards:{undistributedTokens:9}}});};
 const result=await fetchMetrics(mock);assert.equal(result.partial,true);assert.equal(result.values.paidToHolders,55);assert.equal(result.values.waitingToDistribute,9);
 assert.ok(calls[0].endsWith('/tokens/'+MINT));assert.ok(calls[1].endsWith('/rewards'));assert.ok(calls[2].endsWith('/tokens/'+MINT+'/rewards'));
 await assert.rejects(()=>fetchMetrics((async()=>{throw new Error('offline')})));
});
test('computes the payout threshold and progress from live market cap',()=>{
 assert.equal(potThreshold(null),null);
 assert.equal(potThreshold(49999),50);assert.equal(potThreshold(50000),200);
 assert.equal(potThreshold(100000),250);assert.equal(potThreshold(125000),125);
 assert.equal(potThreshold(25000000),50000);
 assert.equal(potProgress(50,125),40);assert.equal(potProgress(150,100),100);
 assert.equal(potProgress(null,100),null);
});
test('formats payout age only from a valid timestamp',()=>{
 const now=Date.parse('2026-09-08T12:00:00Z');
 assert.equal(relativePayout('2026-09-08T10:00:00Z',now),'2h ago');
 assert.equal(relativePayout(null,now),'—');assert.equal(relativePayout('not-a-date',now),'—');
});

