import { createCampaign } from '@/schemas/campaign';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const newCampaign = req.body;
    const createdCampaign = await createCampaign(newCampaign);
    res.status(201).json(createdCampaign);
  }
};

export default handler;
