import { getCampaign, updateCampaign } from '@/schemas/campaign';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const sheet = await getCampaign(id);
    return new Response(JSON.stringify(sheet), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Campaign not found ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 404 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const updates = await req.json();
    const updatedSheet = await updateCampaign(id, updates);
    return NextResponse.json(updatedSheet, {
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
