import { fetchMetrics } from '@/lib/stonkfun';
export async function GET() {
  try {return Response.json(await fetchMetrics(),{headers:{'Cache-Control':'no-store'}});}
  catch {return Response.json({error:'StonkFun temporarily unavailable'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
