import { getCampaign, updateCampaign } from '@/schemas/campaign';
import connect from '@/lib/mongo';
import { NextResponse } from 'next/server';
connect();

type Props = {
  params: { id: string };
};

export async function GET(req: Request, { params }: Props) {
  const { id } = params;
  try {
    const sheet = await getCampaign(id);
    return new Response(JSON.stringify(sheet), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: Props) {
  const { id } = params;
  try {
    const updates = await req.json();
    const updatedSheet = await updateCampaign(id, updates);
    return NextResponse.json(updatedSheet, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 400 },
    );
  }
}
