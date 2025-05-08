import { ReplaceMongooseDocumentArrayByArray } from '@/lib/mongo';
import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

export const characterSheetSchema = new Schema({
  icon: {
    type: {
      url: { type: String, required: true },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
      note: { type: String, required: false, default: '' },
    },
  },
  colorPalette: {
    type: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      tertiary: { type: String, required: true },
    },
    default: {
      primary: '209 213 219',
      secondary: '156 163 175',
      tertiary: '107 114 128',
    },
  },
  name: {
    type: {
      text: { type: String, required: true },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
    },
    required: true,
  },
  description: {
    type: {
      text: { type: String, required: true },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
    },
  },
  fate: {
    type: {
      points: { type: Number, required: true, default: 0 },
      refresh: { type: Number, required: true, default: 0 },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
    },
    required: true,
    default: {
      points: 0,
      refresh: 0,
      visibleIn: [],
    },
  },
  aspects: [
    {
      name: { type: String, default: '' },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
    },
  ],
  skills: {
    type: Map,
    of: [
      {
        name: { type: String, required: true },
        visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
      },
    ],
    keyType: Number,
  },
  stunts: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
    },
  ],
  extras: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] },
    },
  ],
  stress: {
    type: {
      physical: {
        type: {
          boxes: { type: [Boolean], required: true },
          visibleIn: {
            type: [{ type: String, ref: 'Campaign' }],
            default: [],
          },
        },
      },
      mental: {
        type: {
          boxes: { type: [Boolean], required: true },
          visibleIn: {
            type: [{ type: String, ref: 'Campaign' }],
            default: [],
          },
        },
      },
    },
    default: {
      physical: {
        boxes: [false, false],
        visibleIn: [],
      },
      mental: {
        boxes: [false, false],
        visibleIn: [],
      },
    },
  },
  consequences: {
    type: {
      mild: {
        type: {
          name: { type: String, default: '' },
          visibleIn: {
            type: [{ type: String, ref: 'Campaign' }],
            default: [],
          },
        },
      },
      moderate: {
        type: {
          name: { type: String, default: '' },
          visibleIn: {
            type: [{ type: String, ref: 'Campaign' }],
            default: [],
          },
        },
      },
      severe: {
        type: {
          name: { type: String, default: '' },
          visibleIn: {
            type: [{ type: String, ref: 'Campaign' }],
            default: [],
          },
        },
      },
      mental: {
        type: {
          name: { type: String, required: true },
          visibleIn: {
            type: [{ type: String, ref: 'Campaign' }],
            default: [],
          },
        },
      },
      physical: {
        type: {
          name: { type: String, required: true },
          visibleIn: {
            type: [{ type: String, ref: 'Campaign' }],
            default: [],
          },
        },
      },
    },
    default: {
      mild: {
        name: '',
        visibleIn: [],
      },
      moderate: {
        name: '',
        visibleIn: [],
      },
      severe: {
        name: '',
        visibleIn: [],
      },
    },
  },
  notes: {
    type: [
      {
        name: { type: String, required: true },
        content: { type: String, required: true },
        visibleIn: {
          type: [{ type: String, ref: 'Campaign' }],
          default: [],
        },
      },
    ],
    default: [],
  },
  public: { type: Boolean, required: true, default: false },
  visibleTo: [
    {
      type: String,
      ref: 'User',
      default: [],
    },
  ],
  owner: { type: String, ref: 'User', required: true },
  created: { type: Date, required: false, default: Date.now },
  updated: { type: Date, required: false, default: Date.now },
});
export const CharacterSheet =
  mongoose.models.CharacterSheet ||
  model('CharacterSheet', characterSheetSchema);

// Need to override one field here since egh :D
export type CharacterSheetT = {
  skills: { [level: number]: { name: string; visibleIn: string[] }[] };
  _id: string;
} & Omit<
  ReplaceMongooseDocumentArrayByArray<
    InferSchemaType<typeof characterSheetSchema>
  >,
  'skills'
>;

export async function createCharacterSheet(sheet: Partial<CharacterSheetT>) {
  delete sheet?._id;
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
  return await CharacterSheet.find({ owner: userId });
}

export interface sheetWithContext {
  sheet?: CharacterSheetT;
  state: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  skills?: string[];
  position?: { x: number; y: number };
}
