import { Skill } from '@/types/fate';
import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const characterSheetSchema = new Schema({
  icon: {
    type: {
      url: { type: String, required: true },
      visibleIn: [{ type: String, ref: 'Campaign', default: [] }],
    },
  },
  name: {
    type: {
      text: { type: String, required: true },
      visibleIn: [{ type: String, ref: 'Campaign', default: [] }],
    },
    required: true,
  },
  description: {
    type: {
      text: { type: String, required: true },
      visibleIn: [{ type: String, ref: 'Campaign', default: [] }],
    },
  },
  aspects: [
    {
      name: { type: String, required: true },
      visibleIn: [{ type: String, ref: 'Campaign', default: [] }],
    },
  ],
  skills: {
    type: Map,
    of: [
      {
        name: { type: String, required: true },
        visibleIn: [{ type: String, ref: 'Campaign', default: [] }],
      },
    ],
    keyType: Number,
  },
  stunts: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      visibleIn: [{ type: String, ref: 'Campaign', default: [] }],
    },
  ],
  controlledBy: { type: String, ref: 'User', required: true },
});
export const CharacterSheet =
  mongoose.models.CharacterSheet ||
  model('CharacterSheet', characterSheetSchema);

// Need to override one field here since egh :D
export type CharacterSheetT = {
  skills: { [level: number]: { name: Skill; visibleIn: string[] }[] };
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
