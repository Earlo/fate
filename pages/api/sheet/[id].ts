import {
  CharacterSheetT,
  getCharacterSheet,
  updateCharacterSheet,
  deleteCharacterSheet,
} from '@/schemas/sheet';
import connect from '@/lib/mongo';
import { NextApiRequest, NextApiResponse } from 'next';
connect();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.id as string;

  switch (req.method) {
    case 'GET':
      try {
        const sheet = await getCharacterSheet(id);
        res.status(200).json(sheet);
      } catch (error) {
        res.status(404).json({ error: 'Character sheet not found' });
      }
      break;

    case 'PUT':
      try {
        const updates: Partial<CharacterSheetT> = req.body;
        const updatedSheet = await updateCharacterSheet(id, updates);
        res.status(200).json(updatedSheet);
      } catch (error) {
        res.status(400).json({ error: 'Failed to update character sheet' });
      }
      break;

    case 'DELETE':
      try {
        await deleteCharacterSheet(id);
        res.status(204).end();
      } catch (error) {
        res.status(400).json({ error: 'Failed to delete character sheet' });
      }
      break;

    default:
      res.status(405).end(); // Method Not Allowed
      break;
  }
}
