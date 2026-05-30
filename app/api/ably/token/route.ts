import { authErrorResponse, requireUser } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';
import { getAblyRest, isAblyEnabled } from '@/lib/realtime/ably';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!isAblyEnabled()) {
    return NextResponse.json({ error: 'Ably is not enabled' }, { status: 400 });
  }
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    return authErrorResponse(error)!;
  }
  const [sheets, campaigns] = await Promise.all([
    prisma.characterSheet.findMany({
      where: user.admin
        ? undefined
        : {
            OR: [
              { public: true },
              { visibleTo: { has: user.id } },
              { ownerId: user.id },
            ],
          },
      select: { id: true },
    }),
    prisma.campaign.findMany({
      where: user.admin
        ? undefined
        : {
            OR: [
              { public: true },
              { visibleTo: { has: user.id } },
              { ownerId: user.id },
            ],
          },
      select: { id: true },
    }),
  ]);
  const capability = Object.fromEntries([
    [`sheet-list:${user.id}`, ['subscribe']],
    ...sheets.map(({ id }) => [`sheet:${id}`, ['subscribe']]),
    ...campaigns.map(({ id }) => [`campaign:${id}`, ['subscribe', 'presence']]),
  ]);
  const tokenRequest = await getAblyRest().auth.createTokenRequest({
    clientId: user.id,
    capability,
  });
  return NextResponse.json(tokenRequest, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
