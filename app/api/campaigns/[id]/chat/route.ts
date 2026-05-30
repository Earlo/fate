import { authErrorResponse, requireCampaignMember } from '@/lib/apiAuth';
import { publishChatMessage } from '@/lib/realtime/campaigns';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { user } = await requireCampaignMember(id);
    const body = await req.json();
    const kind = body?.kind === 'roll' ? 'roll' : 'chat';
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text && kind === 'chat') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }
    const createdAt = new Date().toISOString();
    await publishChatMessage(id, {
      campaignId: id,
      text: text || 'Rolled the dice',
      createdAt,
      kind,
      roll: body?.roll,
      sender: { id: user.id, name: user.username, guest: false },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
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
