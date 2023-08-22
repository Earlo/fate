import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const characterSheetSchema = new Schema({
  name: String,
  stats: Object,
  visibleTo: [String],
  controlledBy: String,
});
export const CharacterSheet =
  mongoose.models.CharacterSheet ||
  model('CharacterSheet', characterSheetSchema);
export type CharacterSheetT = InferSchemaType<typeof characterSheetSchema>;

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
