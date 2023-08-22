import {
  CharacterSheetT,
  createCharacterSheet,
  getCharacterSheet,
  updateCharacterSheet,
  deleteCharacterSheet,
} from '@/schemas/sheet';
import connect from '@/lib/mongo';
import { NextApiRequest, NextApiResponse } from 'next';
connect();

// POST request to create a character sheet
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'POST':
      try {
        const sheet: CharacterSheetT = req.body;
        const newSheet = await createCharacterSheet(sheet);
        res.status(201).json(newSheet);
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Failed to create character sheet' });
      }
      break;

    case 'GET':
      try {
        const sheet = await getCharacterSheet(req.query.id as string);
        res.status(200).json(sheet);
      } catch (error) {
        res.status(404).json({ error: 'Character sheet not found' });
      }
      break;

    case 'PUT':
      try {
        const updates: Partial<CharacterSheetT> = JSON.parse(req.body);
        const updatedSheet = await updateCharacterSheet(
          req.query.id as string,
          updates,
        );
        res.status(200).json(updatedSheet);
      } catch (error) {
        res.status(400).json({ error: 'Failed to update character sheet' });
      }
      break;

    case 'DELETE':
      try {
        await deleteCharacterSheet(req.query.id as string);
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
