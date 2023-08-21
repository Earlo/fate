import { CharacterSheetT, CharacterSheet } from '@/schemas/sheet';
import connect from '@/lib/mongo';
connect();

export async function createCharacterSheet(sheet: CharacterSheetT) {
  return await CharacterSheet.create(sheet);
}

export async function getCharacterSheet(id: string) {
  return await CharacterSheet.findById(id);
}

export async function updateCharacterSheet(
  id: string,
  updates: Partial<CharacterSheetT>,
) {
  return await CharacterSheet.findByIdAndUpdate(id, updates);
}

export async function deleteCharacterSheet(id: string) {
  return await CharacterSheet.findByIdAndDelete(id);
}
