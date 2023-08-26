import { getCharacterSheets } from '@/schemas/sheet';
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
        const sheets = await getCharacterSheets(req.query.id as string);
        res.status(200).json(sheets);
      } catch (error) {
        res.status(404).json({ error: 'Character sheet not found' });
      }
      break;
    default:
      res.status(405).end(); // Method Not Allowed
      break;
  }
}
