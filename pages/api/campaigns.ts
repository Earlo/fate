import { getCampaigns } from '@/schemas/campaign';
import connect from '@/lib/mongo';
import { NextApiRequest, NextApiResponse } from 'next';
connect();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      try {
        const campaigns = await getCampaigns(req.query.id as string);
        res.status(200).json(campaigns);
      } catch (error) {
        res.status(404).json({ error: 'Campaigns not found' });
      }
      break;
    default:
      res.status(405).end(); // Method Not Allowed
      break;
  }
}
