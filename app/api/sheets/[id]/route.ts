import {
  handleDeleteById,
  handleGetById,
  handleUpdateById,
} from '@/app/api/helpers/handlers';
import {
  CharacterSheetT,
  deleteCharacterSheet,
  getCharacterSheet,
  updateCharacterSheet,
} from '@/schemas/sheet';
import { type NextRequest } from 'next/server';

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
  return handleUpdateById<CharacterSheetT>(
    req,
    params,
    updateCharacterSheet,
    'Failed to update character sheet',
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleDeleteById(
    params,
    deleteCharacterSheet,
    'Failed to delete character sheet',
  );
}
