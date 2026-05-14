import { subscribeCampaign } from '@/lib/realtime/campaigns';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = new URL(req.url).searchParams;
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: userId' },
      { status: 400 },
    );
  }
  const username = searchParams.get('username') ?? 'Guest';
  const isGuest = userId.startsWith('guest_');
  const viewer = { id: userId, username: username ?? 'Guest', guest: isGuest };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const unsubscribe = subscribeCampaign(id, controller, viewer);
      req.signal.addEventListener('abort', () => unsubscribe(), { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    },
  });
}
