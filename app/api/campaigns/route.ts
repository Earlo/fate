import { createCampaign, getCampaigns } from '@/schemas/campaign';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const newCampaign = await req.json();
    const createdCampaign = await createCampaign(newCampaign);
    if (!createdCampaign) {
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 },
      );
    }
    return NextResponse.json(createdCampaign, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to create campaign sheet' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get('id');
    if (!userId) {
      return NextResponse.json(null, { status: 400 });
    }
    const campaigns = await getCampaigns(userId);
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to get character campaigns ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 500 },
    );
  }
}
