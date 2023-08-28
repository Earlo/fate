import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const campaignSchema = new Schema({
  name: { type: String, required: true },
  icon: String,
  description: String,
  factions: [
    {
      name: { type: String, required: true },
      visible: { type: Boolean, required: true, default: false },
      characters: [
        {
          charachter: {
            type: String,
            ref: 'CharacterSheet',
            required: true,
          },
          visible: { type: Boolean, required: true, default: false },
        },
      ],
    },
  ],
  public: { type: Boolean, required: true, default: false },
  visibleTo: [
    {
      type: String,
      ref: 'User',
    },
  ],
  controlledBy: { type: String, ref: 'User', required: true },
});

export const Campaign =
  mongoose.models.Campaign || model('Campaign', campaignSchema);

export type CampaignT = {
  _id: string;
} & InferSchemaType<typeof campaignSchema>;

export async function createCampaign(campaign: CampaignT) {
  return await Campaign.create(campaign);
}

export async function getCampaign(id: string) {
  return await Campaign.findById(id);
}

export async function updateCampaign(id: string, updates: Partial<CampaignT>) {
  // Remove _id and __v to avoid updating these fields
  delete updates._id;
  //delete updates?.__v;
  return await Campaign.findByIdAndUpdate(id, updates, {
    new: true,
  });
}
export const getCampaigns = async (userId: string) => {
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
