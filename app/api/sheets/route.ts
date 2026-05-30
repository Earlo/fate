import { authErrorResponse, requireUser } from '@/lib/apiAuth';
import { publishSheetListUpdate } from '@/lib/realtime/sheets';
import {
  CharacterSheetT,
  createCharacterSheet,
  getCharacterSheets,
} from '@/schemas/sheet';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const payload: CharacterSheetT = await req.json();
    const created = await createCharacterSheet({ ...payload, owner: user.id });
    if (!created) {
      return NextResponse.json(
        { error: 'Failed to create character sheet' },
        { status: 500 },
      );
    }
    if (created.owner) {
      await publishSheetListUpdate(created.owner, {
        ownerId: created.owner,
        sheetId: created.id,
        updatedAt: created.updated?.toISOString(),
      });
    }
    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create character sheet' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const requestedId = new URL(req.url).searchParams.get('id');
    const ownerId = user.admin && requestedId ? requestedId : user.id;
    return NextResponse.json(await getCharacterSheets(ownerId));
  } catch (error) {
    return (
      authErrorResponse(error) ??
      NextResponse.json(
        { error: 'Failed to get character sheets' },
        { status: 500 },
      )
    );
  }
}
