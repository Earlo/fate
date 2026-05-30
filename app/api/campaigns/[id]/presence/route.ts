import {
  authErrorResponse,
  getCurrentUser,
  requireCampaignRead,
} from '@/lib/apiAuth';
import { updatePresenceName } from '@/lib/realtime/campaigns';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    await requireCampaignRead(id);
    const body = await req.json();
    const requestedViewerId =
      typeof body?.viewerId === 'string' ? body.viewerId : '';
    const viewerId =
      user?.id ??
      (requestedViewerId.startsWith('guest_') ? requestedViewerId : '');
    const username =
      typeof body?.username === 'string' ? body.username.trim() : '';
    if (!viewerId || !username) {
      return NextResponse.json(
        { error: 'viewerId and username are required' },
        { status: 400 },
      );
    }
    await updatePresenceName(id, viewerId, username);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      {
        error: `Failed to update presence ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 400 },
    );
  }
}
