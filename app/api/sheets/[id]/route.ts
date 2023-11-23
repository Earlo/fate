import {
  CharacterSheetT,
  getCharacterSheet,
  updateCharacterSheet,
  deleteCharacterSheet,
} from '@/schemas/sheet';
import connect from '@/lib/mongo';
import { NextResponse } from 'next/server';
connect();

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  try {
    const sheet = await getCharacterSheet(id);
    return new Response(JSON.stringify(sheet), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Character sheet not found' },
      { status: 404 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  try {
    const updates: Partial<CharacterSheetT> = await req.json();
    const updatedSheet = await updateCharacterSheet(id, updates);
    return NextResponse.json(updatedSheet, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update character sheet' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  try {
    await deleteCharacterSheet(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete character sheet' },
      { status: 400 },
    );
  }
}
