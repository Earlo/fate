import { handleGetById } from '@/app/api/helpers/handlers';
import { publishCampaignUpdate } from '@/lib/realtime/campaigns';
import {
  publishSheetListUpdate,
  publishSheetUpdate,
} from '@/lib/realtime/sheets';
import { getCampaignIdsBySheetId } from '@/schemas/campaign';
import {
  CharacterSheetT,
  deleteCharacterSheet,
  getCharacterSheet,
  updateCharacterSheet,
} from '@/schemas/sheet';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleGetById(params, getCharacterSheet, 'Character sheet not found');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const updates: Partial<CharacterSheetT> = await req.json();
    const updated = await updateCharacterSheet(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update character sheet' },
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const payload = {
      sheetId: id,
      ownerId: updated.owner,
      updatedAt: updated.updated?.toISOString(),
    };
    await publishSheetUpdate(id, payload);
    if (updated.owner) {
      await publishSheetListUpdate(updated.owner, payload);
    }
    const campaignIds = await getCampaignIdsBySheetId(id);
    await Promise.all(
      campaignIds.map((campaignId) =>
        publishCampaignUpdate(campaignId, {
          campaignId,
          updatedAt: payload.updatedAt,
        }),
      ),
    );
    return NextResponse.json(updated, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to update character sheet ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const existing = await getCharacterSheet(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Failed to delete character sheet' },
        { status: 404 },
      );
    }
    await deleteCharacterSheet(id);
    const payload = {
      sheetId: id,
      ownerId: existing.owner,
      deleted: true,
      updatedAt: existing.updated?.toISOString(),
    };
    await publishSheetUpdate(id, payload);
    if (existing.owner) {
      await publishSheetListUpdate(existing.owner, payload);
    }
    const campaignIds = await getCampaignIdsBySheetId(id);
    await Promise.all(
      campaignIds.map((campaignId) =>
        publishCampaignUpdate(campaignId, {
          campaignId,
          updatedAt: payload.updatedAt,
        }),
      ),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to delete character sheet ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 400 },
    );
  }
}
