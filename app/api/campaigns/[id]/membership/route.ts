import { authErrorResponse, requireUser } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';
import { publishCampaignUpdate } from '@/lib/realtime/campaigns';
import { NextResponse } from 'next/server';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { visibleTo: true },
    });
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 },
      );
    }
    const joined = !campaign.visibleTo.includes(user.id);
    const visibleTo = joined
      ? [...campaign.visibleTo, user.id]
      : campaign.visibleTo.filter((id) => id !== user.id);
    const updated = await prisma.campaign.update({
      where: { id },
      data: { visibleTo },
    });
    await publishCampaignUpdate(id, {
      campaignId: id,
      updatedAt: updated.updated.toISOString(),
    });
    return NextResponse.json({ joined, visibleTo });
  } catch (error) {
    return (
      authErrorResponse(error) ??
      NextResponse.json(
        { error: 'Failed to update campaign membership' },
        { status: 400 },
      )
    );
  }
}
