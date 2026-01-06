import { subscribeSheetList } from '@/lib/realtime/sheets';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const ownerId = new URL(req.url).searchParams.get('userId');
  if (!ownerId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const unsubscribe = subscribeSheetList(ownerId, controller);
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
