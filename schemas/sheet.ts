import { Skill } from '@/types/fate';
import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const characterSheetSchema = new Schema({
  name: { type: String, required: true },
  icon: String,
  description: String,
  aspects: [String],
  skills: { type: Map, of: [String], keyType: Number },
  stunts: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  visibleToPlayers: Boolean,
  controlledBy: { type: String, ref: 'User' },
});
export const CharacterSheet =
  mongoose.models.CharacterSheet ||
  model('CharacterSheet', characterSheetSchema);

// Need to override one field here since egh :D
export type CharacterSheetT = {
  skills: { [level: number]: Skill[] };
  _id: string;
} & Omit<InferSchemaType<typeof characterSheetSchema>, 'skills'>;

export async function createCharacterSheet(sheet: CharacterSheetT) {
  return await CharacterSheet.create(sheet);
}

export async function getCharacterSheet(sheetId: string) {
  return await CharacterSheet.findById(sheetId);
}

export async function updateCharacterSheet(
  sheetId: string,
  updates: Partial<CharacterSheetT>,
) {
  return await CharacterSheet.findByIdAndUpdate(sheetId, updates, {
    new: true,
  });
}

export async function deleteCharacterSheet(sheetId: string) {
  return await CharacterSheet.findByIdAndDelete(sheetId);
}

export async function getCharacterSheets(userId: string) {
  return await CharacterSheet.find({ controlledBy: userId });
}
