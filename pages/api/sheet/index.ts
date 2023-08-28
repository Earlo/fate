import { CharacterSheetT, createCharacterSheet } from '@/schemas/sheet';
import connect from '@/lib/mongo';
import { NextApiRequest, NextApiResponse } from 'next';
connect();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const sheet: CharacterSheetT = req.body;
      const newSheet = await createCharacterSheet(sheet);
      return res.status(201).json(newSheet);
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ error: 'Failed to create character sheet' });
    }
  } else {
    return res.status(405).end();
  }
}
