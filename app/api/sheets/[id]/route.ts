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
  const { id } = await params;
  try {
    const sheet = await getCharacterSheet(id);
    return new Response(JSON.stringify(sheet), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Character sheet not found ${
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
    const updates: Partial<CharacterSheetT> = await req.json();
    const updatedSheet = await updateCharacterSheet(id, updates);
    return NextResponse.json(updatedSheet, {
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
    await deleteCharacterSheet(id);
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
