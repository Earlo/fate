import { handleListByUser } from '@/app/api/helpers/handlers';
import { publishSheetListUpdate } from '@/lib/realtime/sheets';
import {
  CharacterSheetT,
  createCharacterSheet,
  getCharacterSheets,
} from '@/schemas/sheet';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload: CharacterSheetT = await req.json();
    const created = await createCharacterSheet(payload);
    if (!created) {
      return NextResponse.json(
        { error: 'Failed to create character sheet' },
        { status: 500 },
      );
    }
    if (created.owner) {
      publishSheetListUpdate(created.owner, {
        ownerId: created.owner,
        sheetId: created.id,
        updatedAt: created.updated?.toISOString(),
      });
    }
    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create character sheet' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handleListByUser(
    req,
    getCharacterSheets,
    'Failed to get character sheets',
  );
}
