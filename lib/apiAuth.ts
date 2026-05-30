import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { campaignContainsSheet } from '@/schemas/campaign';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export type AuthenticatedUser = {
  id: string;
  username: string;
  admin: boolean;
};

export class ApiAuthError extends Error {
  constructor(
    public status: 401 | 403 | 404,
    message: string,
  ) {
    super(message);
  }
}

export const authErrorResponse = (error: unknown) =>
  error instanceof ApiAuthError
    ? NextResponse.json({ error: error.message }, { status: error.status })
    : null;

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user
    ? {
        id: session.user.id,
        username: session.user.username,
        admin: session.user.admin,
      }
    : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiAuthError(401, 'Authentication required');
  return user;
}

export async function requireSheetRead(id: string, campaignId?: string | null) {
  const user = await getCurrentUser();
  const sheet = await prisma.characterSheet.findUnique({
    where: { id },
    select: { ownerId: true, public: true, visibleTo: true },
  });
  if (!sheet) throw new ApiAuthError(404, 'Character sheet not found');
  const canReadFullSheet =
    sheet.public ||
    user?.admin ||
    sheet.ownerId === user?.id ||
    sheet.visibleTo.includes(user?.id ?? '');
  if (canReadFullSheet) {
    return { user, sheet, campaignScoped: false };
  }
  if (campaignId) {
    const campaign = await campaignContainsSheet(campaignId, id);
    if (campaign?.containsSheet) {
      return {
        user,
        sheet,
        campaignScoped: true,
        canManageCampaign: user?.admin || campaign.ownerId === user?.id,
      };
    }
  }
  if (
    !sheet.public &&
    !user?.admin &&
    sheet.ownerId !== user?.id &&
    !sheet.visibleTo.includes(user?.id ?? '')
  ) {
    throw new ApiAuthError(user ? 403 : 401, 'Character sheet access denied');
  }
  return { user, sheet, campaignScoped: false };
}

export async function requireSheetWrite(id: string) {
  const user = await requireUser();
  const sheet = await prisma.characterSheet.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!sheet) throw new ApiAuthError(404, 'Character sheet not found');
  if (!user.admin && sheet.ownerId !== user.id) {
    throw new ApiAuthError(403, 'Character sheet access denied');
  }
  return { user, sheet };
}

export async function requireCampaignRead(id: string) {
  const user = await getCurrentUser();
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { ownerId: true, public: true, visibleTo: true },
  });
  if (!campaign) throw new ApiAuthError(404, 'Campaign not found');
  return { user, campaign };
}

export async function requireCampaignMember(id: string) {
  const user = await requireUser();
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { ownerId: true, visibleTo: true },
  });
  if (!campaign) throw new ApiAuthError(404, 'Campaign not found');
  if (
    !user.admin &&
    campaign.ownerId !== user.id &&
    !campaign.visibleTo.includes(user.id)
  ) {
    throw new ApiAuthError(403, 'Campaign membership required');
  }
  return { user, campaign };
}

export async function requireCampaignWrite(id: string) {
  const user = await requireUser();
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!campaign) throw new ApiAuthError(404, 'Campaign not found');
  if (!user.admin && campaign.ownerId !== user.id) {
    throw new ApiAuthError(403, 'Campaign access denied');
  }
  return { user, campaign };
}
