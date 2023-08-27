import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

export const campaignSchema = new Schema({
  name: { type: String, required: true },
  icon: String,
  description: String,
  factions: [
    {
      name: { type: String, required: true },
      characters: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CharacterSheet',
        },
      ],
    },
  ],
  public: { type: Boolean, required: true, default: false },
  visibleTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
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
  return await Campaign.findByIdAndUpdate(id, updates, {
    new: true,
  });
}
