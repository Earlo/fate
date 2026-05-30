import { authErrorResponse, requireUser } from '@/lib/apiAuth';
import { subscribeSheetList } from '@/lib/realtime/sheets';
import { type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  let ownerId: string;
  try {
    const user = await requireUser();
    const requestedId = new URL(req.url).searchParams.get('userId');
    ownerId = user.admin && requestedId ? requestedId : user.id;
  } catch (error) {
    return authErrorResponse(error)!;
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
