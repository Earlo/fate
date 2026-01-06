import { handleGetById } from '@/app/api/helpers/handlers';
import { publishCampaignUpdate } from '@/lib/realtime/campaigns';
import { getCampaign, updateCampaign } from '@/schemas/campaign';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleGetById(params, getCampaign, 'Campaign not found');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const updates = await req.json();
    const updated = await updateCampaign(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
    publishCampaignUpdate(id, {
      campaignId: id,
      updatedAt: updated.updated?.toISOString(),
    });
    return NextResponse.json(updated, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
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
