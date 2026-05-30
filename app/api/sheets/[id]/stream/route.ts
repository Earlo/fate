import { authErrorResponse, requireSheetRead } from '@/lib/apiAuth';
import { subscribeSheet } from '@/lib/realtime/sheets';
import { type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await requireSheetRead(id, new URL(req.url).searchParams.get('campaignId'));
  } catch (error) {
    return authErrorResponse(error)!;
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const unsubscribe = subscribeSheet(id, controller);
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
