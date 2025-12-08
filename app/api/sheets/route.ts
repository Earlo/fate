import {
  CharacterSheetT,
  createCharacterSheet,
  getCharacterSheets,
} from '@/schemas/sheet';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const sheet: CharacterSheetT = await req.json();
    const newSheet = await createCharacterSheet(sheet);
    if (!newSheet) {
      return NextResponse.json(
        { error: 'Failed to create character sheet' },
        { status: 500 },
      );
    }
    return NextResponse.json(newSheet, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to create character sheet' },
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
    const sheets = await getCharacterSheets(userId);
    return NextResponse.json(sheets, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to get character sheets ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 500 },
    );
  }
}
