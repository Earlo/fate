import { getCampaigns, createCampaign } from '@/schemas/campaign';
import connect from '@/lib/mongo';
import { NextResponse } from 'next/server';

connect();

export async function POST(req: Request) {
  try {
    const newCampaign = await req.json();
    const createdCampaign = await createCampaign(newCampaign);
    return NextResponse.json(createdCampaign, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to create campaign sheet' },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get('id');
    if (!userId) {
      return NextResponse.json(null, { status: 400 });
    }
    const campaigns = await getCampaigns(userId);
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get character campaigns' },
      { status: 500 },
    );
  }
}
