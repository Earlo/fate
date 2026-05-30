import { authErrorResponse, requireUser } from '@/lib/apiAuth';
import { createCampaign, getCampaigns } from '@/schemas/campaign';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const payload = await req.json();
    return NextResponse.json(
      await createCampaign({ ...payload, owner: user.id }),
      { status: 200 },
    );
  } catch (error) {
    return (
      authErrorResponse(error) ??
      NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    );
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json(await getCampaigns(user.id), { status: 200 });
  } catch (error) {
    return (
      authErrorResponse(error) ??
      NextResponse.json(
        { error: 'Failed to get character campaigns' },
        { status: 500 },
      )
    );
  }
}
