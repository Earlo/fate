import { Skill } from '@/types/fate';
import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const characterSheetSchema = new Schema({
  name: { type: String, required: true },
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
  controlledBy: String,
});
export const CharacterSheet =
  mongoose.models.CharacterSheet ||
  model('CharacterSheet', characterSheetSchema);

// Need to override one field here since egh :D
export type CharacterSheetT = {
  skills: { [level: number]: Skill[] };
} & InferSchemaType<typeof characterSheetSchema>;

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

export async function getCharacterSheets(id: string) {
  return await CharacterSheet.find({ controlledBy: id });
}
