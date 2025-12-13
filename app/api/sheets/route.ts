import { handleCreate, handleListByUser } from '@/app/api/helpers/handlers';
import {
  CharacterSheetT,
  createCharacterSheet,
  getCharacterSheets,
} from '@/schemas/sheet';
import { type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return handleCreate<CharacterSheetT>(
    req,
    createCharacterSheet,
    'Failed to create character sheet',
  );
}

export async function GET(req: NextRequest) {
  return handleListByUser(
    req,
    getCharacterSheets,
    'Failed to get character sheets',
  );
}
