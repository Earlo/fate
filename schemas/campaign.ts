import { CharacterSheetT } from './sheet';
import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const campaignSchema = new Schema({
  name: { type: String, required: true },
  icon: String,
  description: String,
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
  aspects: [
    {
      name: { type: String, default: '' },
      visibleIn: { type: [{ type: String, ref: 'Campaign' }], default: [] }, // Pointless. Maybe it could reference players instead.
    },
  ],
  skills: [
    {
      name: { type: String, default: '' },
      actions: [
        {
          type: String,
          enum: ['overcome', 'advantage', 'attack', 'defend'], // is this something we want to hard code?
        },
      ],
    },
  ],
  factions: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true, default: '' },
      icon: String,
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
      characters: [
        {
          sheet: {
            type: String,
            ref: 'CharacterSheet',
            required: true,
          },
          visible: { type: Boolean, required: true, default: false },
        },
      ],

      visible: { type: Boolean, required: true, default: false },
      public: { type: Boolean, required: true, default: false },
    },
  ],
  public: { type: Boolean, required: true, default: false },
  visibleTo: {
    type: [
      {
        type: String,
        ref: 'User',
      },
    ],
    default: [],
  },
  controlledBy: { type: String, ref: 'User', required: true },
});

export const Campaign =
  mongoose.models.Campaign || model('Campaign', campaignSchema);

export type CampaignT = {
  _id: string;
} & InferSchemaType<typeof campaignSchema>;

export type PopulatedFaction = Omit<CampaignT['factions'][0], 'characters'> & {
  characters: { sheet: CharacterSheetT; visible: boolean }[];
};

export type PopulatedCampaignT = {
  _id: string;
  factions: PopulatedFaction[];
} & Omit<InferSchemaType<typeof campaignSchema>, 'factions'>;

export async function createCampaign(campaign: CampaignT) {
  return await Campaign.create(campaign);
}

export async function getCampaign(id: string) {
  return await Campaign.findById(id).populate('factions.characters.sheet');
}

export async function updateCampaign(id: string, updates: Partial<CampaignT>) {
  // Remove _id and __v to avoid updating these fields
  delete updates._id;
  //delete updates?.__v;
  return await Campaign.findByIdAndUpdate(id, updates, {
    new: true,
  });
}
export const getCampaigns = async (
  userId: string,
): Promise<PopulatedCampaignT[]> => {
  return await Campaign.find({
    $or: [
      { public: true },
      { visibleTo: { $in: [userId] } },
      { controlledBy: userId },
    ],
  }).populate({
    path: 'factions.characters',
    populate: {
      path: 'player',
      select: 'name',
    },
  });
};
