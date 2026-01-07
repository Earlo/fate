import { updatePresenceName } from '@/lib/realtime/campaigns';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const viewerId = typeof body?.viewerId === 'string' ? body.viewerId : null;
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
