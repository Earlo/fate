import {
  authErrorResponse,
  requireSheetRead,
  requireSheetWrite,
} from '@/lib/apiAuth';
import { publishCampaignUpdate } from '@/lib/realtime/campaigns';
import {
  publishSheetListUpdate,
  publishSheetUpdate,
} from '@/lib/realtime/sheets';
import { getCampaignIdsBySheetId } from '@/schemas/campaign';
import {
  CharacterSheetT,
  deleteCharacterSheet,
  getCampaignVisibleCharacterSheet,
  getCharacterSheet,
  updateCharacterSheet,
} from '@/schemas/sheet';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const campaignId = new URL(req.url).searchParams.get('campaignId');
    const access = await requireSheetRead(id, campaignId);
    const sheet = await getCharacterSheet(id);
    return NextResponse.json(
      sheet && access.campaignScoped && !access.canManageCampaign
        ? getCampaignVisibleCharacterSheet(sheet, campaignId!)
        : sheet,
    );
  } catch (error) {
    return (
      authErrorResponse(error) ??
      NextResponse.json({ error: 'Character sheet not found' }, { status: 404 })
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await requireSheetWrite(id);
    const updates: Partial<CharacterSheetT> = await req.json();
    delete updates.owner;
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
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
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
    await requireSheetWrite(id);
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
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
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
