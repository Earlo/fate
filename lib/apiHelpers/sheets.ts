import { CharacterSheetT } from '@/schemas/sheet';

export const getCharacterSheetsByUserId = async (
  id: string,
): Promise<CharacterSheetT[]> => {
  return await fetch(`/api/sheets?id=${id}`).then((res) => res.json());
};

export const updateCharacterSheet = async (
  id: string,
  sheet: Partial<CharacterSheetT>,
): Promise<CharacterSheetT> => {
  return await fetch(`/api/sheets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sheet),
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
};

export const createCharacterSheet = async (
  sheet: Partial<CharacterSheetT>,
): Promise<CharacterSheetT> => {
  return await fetch(`/api/sheets`, {
    method: 'POST',
    body: JSON.stringify(sheet),
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
};
