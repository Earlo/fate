import { CharacterSheetT } from './sheet';
import { UserModel } from './user';
import { ReplaceMongooseDocumentArrayByArray } from '@/lib/mongo';
import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const groupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true, default: '' },
  icon: {
    type: {
      url: { type: String, required: true },
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
  characters: [
    {
      sheet: {
        type: String,
        ref: 'CharacterSheet',
        required: true,
      },
      visible: { type: Boolean, required: true, default: false },
      position: {
        type: {
          x: { type: Number, required: true, default: 0 },
          y: { type: Number, required: true, default: 0 },
        },
        default: { x: 0, y: 0 },
      },
    },
  ],
  layout: {
    type: {
      mode: {
        type: String,
        enum: ['list', 'grid'],
        default: 'list',
      },
      dimensions: {
        type: {
          w: { type: Number, required: true, default: 3 },
          h: { type: Number, required: true, default: 3 },
        },
        default: { w: 3, h: 3 },
      },
    },
    default: { mode: 'list', dimensions: { w: 3, h: 3 } },
  },
  children: {
    type: [this],
    default: [],
  },
  visible: { type: Boolean, required: true, default: false },
  public: { type: Boolean, required: true, default: false },
});

export const campaignSchema = new Schema({
  name: { type: String, required: true },
  icon: {
    type: {
      url: { type: String, required: true },
      note: { type: String, required: false, default: '' },
    },
  },
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
  groups: {
    type: [groupSchema],
    default: [],
  },
  public: { type: Boolean, required: true, default: false },
  notes: {
    type: [
      {
        _id: false,
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
  visibleTo: {
    type: [{ type: String, ref: 'User' }],
    default: [],
  },
  owner: { type: String, ref: 'User', required: true },
  created: { type: Date, required: false, default: Date.now },
  updated: { type: Date, required: false, default: Date.now },
});

export const Campaign =
  mongoose.models.Campaign || model('Campaign', campaignSchema);

export type CampaignT = {
  _id: string;
} & ReplaceMongooseDocumentArrayByArray<InferSchemaType<typeof campaignSchema>>;

export type GroupT = ReplaceMongooseDocumentArrayByArray<
  InferSchemaType<typeof groupSchema>
>;
export type PopulatedGroup = Omit<GroupT, 'characters'> & {
  characters: { sheet: CharacterSheetT; visible: boolean }[];
};

export type PopulatedCampaignT = {
  _id: string;
  groups: PopulatedGroup[];
} & Omit<
  ReplaceMongooseDocumentArrayByArray<InferSchemaType<typeof campaignSchema>>,
  'groups'
>;

export async function createCampaign(campaign: CampaignT) {
  return await Campaign.create(campaign);
}

export async function getCampaign(id: string) {
  // remove _id from subdocuments
  return await Campaign.findById(id).populate('groups.characters.sheet');
}

export async function updateCampaign(
  id: string,
  updates: Partial<CampaignT>,
): Promise<CampaignT | null> {
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
  //check if userId is admin
  const isAdmin = await UserModel.findById(userId).select('admin');
  if (isAdmin?.admin) {
    return await Campaign.find().populate({
      path: 'groups.characters',
      populate: {
        path: 'player',
        select: 'name',
      },
    });
  }
  return await Campaign.find({
    $or: [
      { public: true },
      { visibleTo: { $in: [userId] } },
      { owner: userId },
    ],
  }).populate({
    path: 'groups.characters',
    populate: {
      path: 'player',
      select: 'name',
    },
  });
};
