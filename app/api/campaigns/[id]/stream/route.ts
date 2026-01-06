import { subscribeCampaign } from '@/lib/realtime/campaigns';
import { type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = new URL(req.url).searchParams;
  const userId = searchParams.get('userId') ?? undefined;
  const username = searchParams.get('username') ?? undefined;
  const guestId = searchParams.get('guestId') ?? undefined;
  const viewer = userId
    ? { id: userId, userId, username: username ?? undefined }
    : guestId
      ? { id: guestId, username: username ?? 'Guest', guest: true }
      : undefined;

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
