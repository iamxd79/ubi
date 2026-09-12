import { getHolderSnapshot } from '@/lib/holder';

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get('wallet')?.trim() || '';
  try {
    return Response.json(await getHolderSnapshot(wallet), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Holder data is unavailable.';
    return Response.json({ error: message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
}