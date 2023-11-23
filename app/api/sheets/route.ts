import {
  CharacterSheetT,
  createCharacterSheet,
  getCharacterSheets,
} from '@/schemas/sheet';
import connect from '@/lib/mongo';
import { NextResponse } from 'next/server';
connect();

export async function POST(req: Request) {
  try {
    const sheet: CharacterSheetT = await req.json();
    const newSheet = await createCharacterSheet(sheet);
    return NextResponse.json(newSheet, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: 'Failed to create character sheet',
      },
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
    const sheets = await getCharacterSheets(userId);
    return NextResponse.json(sheets, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get character sheets' },
      { status: 500 },
    );
  }
}
