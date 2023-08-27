import { getCampaign, updateCampaign } from '@/schemas/campaign';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const campaign = await getCampaign(id as string);
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }
    res.status(200).json(campaign);
  }

  if (req.method === 'PUT') {
    const updates = req.body;
    const updatedCampaign = await updateCampaign(id as string, updates);
    res.status(200).json(updatedCampaign);
  }
};

export default handler;
