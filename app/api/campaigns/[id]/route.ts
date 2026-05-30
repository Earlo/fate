import {
  authErrorResponse,
  requireCampaignRead,
  requireCampaignWrite,
} from '@/lib/apiAuth';
import { publishCampaignUpdate } from '@/lib/realtime/campaigns';
import { getCampaign, updateCampaign } from '@/schemas/campaign';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { user } = await requireCampaignRead(id);
    return NextResponse.json(await getCampaign(id, user ?? undefined));
  } catch (error) {
    return (
      authErrorResponse(error) ??
      NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await requireCampaignWrite(id);
    const updates = await req.json();
    delete updates.owner;
    const updated = await updateCampaign(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
    await publishCampaignUpdate(id, {
      campaignId: id,
      updatedAt: updated.updated?.toISOString(),
    });
    return NextResponse.json(updated, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      {
        error: `Failed to update campaign ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 400 },
    );
  }
}
