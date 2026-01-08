import { publishChatMessage } from '@/lib/realtime/campaigns';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const kind = body?.kind === 'roll' ? 'roll' : 'chat';
    const message =
      typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message && kind === 'chat') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }
    const createdAt = new Date().toISOString();
    await publishChatMessage(id, {
      campaignId: id,
      message: message || 'Rolled the dice',
      createdAt,
      kind,
      roll: body?.roll,
      sender: body?.sender,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to send chat message ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 400 },
    );
  }
}
