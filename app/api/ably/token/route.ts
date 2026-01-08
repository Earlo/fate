import { getAblyRest, isAblyEnabled } from '@/lib/realtime/ably';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  if (!isAblyEnabled()) {
    return NextResponse.json({ error: 'Ably is not enabled' }, { status: 400 });
  }
  // TODO: Restrict token issuance (authn/z + capabilities) instead of accepting any clientId.
  const clientId = new URL(req.url).searchParams.get('clientId') ?? undefined;
  const tokenRequest = await getAblyRest().auth.createTokenRequest({
    clientId,
  });
  return NextResponse.json(tokenRequest, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
