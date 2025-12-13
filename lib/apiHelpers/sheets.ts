import { CharacterSheetT } from '@/schemas/sheet';
import { fetchJson } from './base';

export const getCharacterSheetsByUserId = async (
  id: string,
): Promise<CharacterSheetT[]> => {
  return fetchJson<CharacterSheetT[]>(`/api/sheets?id=${id}`);
};

export const updateCharacterSheet = async (
  id: string,
  sheet: Partial<CharacterSheetT>,
): Promise<CharacterSheetT> => {
  return fetchJson<CharacterSheetT>(`/api/sheets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sheet),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const createCharacterSheet = async (
  sheet: Partial<CharacterSheetT>,
): Promise<CharacterSheetT> => {
  return fetchJson<CharacterSheetT>(`/api/sheets`, {
    method: 'POST',
    body: JSON.stringify(sheet),
    headers: { 'Content-Type': 'application/json' },
  });
};
