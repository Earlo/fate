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
