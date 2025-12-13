import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

export type CharacterSheetT = {
  _id: string;
  icon?: { url: string; visibleIn: string[]; note?: string };
  colorPalette: { primary: string; secondary: string; tertiary: string };
  name: { text: string; visibleIn: string[] };
  description?: { text: string; visibleIn: string[] };
  fate: { points: number; refresh: number; visibleIn: string[] };
  aspects: { name: string; visibleIn: string[] }[];
  skills: { [level: number]: { name: string; visibleIn: string[] }[] };
  stunts: { name: string; description: string; visibleIn: string[] }[];
  extras: { name: string; description: string; visibleIn: string[] }[];
  stress: {
    physical: { boxes: boolean[]; visibleIn: string[] };
    mental: { boxes: boolean[]; visibleIn: string[] };
  };
  consequences: {
    mild: { name: string; visibleIn: string[] };
    moderate: { name: string; visibleIn: string[] };
    severe: { name: string; visibleIn: string[] };
    mental?: { name: string; visibleIn: string[] };
    physical?: { name: string; visibleIn: string[] };
  };
  notes: { name: string; content: string; visibleIn: string[] }[];
  public: boolean;
  visibleTo: string[];
  owner: string;
  created?: Date;
  updated?: Date;
};

export interface sheetWithContext {
  sheet?: CharacterSheetT;
  state: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  skills?: string[];
  position?: { x: number; y: number };
}

type CharacterSheetRow = {
  id: string;
  icon: Prisma.JsonValue | null;
  colorPalette: Prisma.JsonValue | null;
  name: Prisma.JsonValue;
  description: Prisma.JsonValue | null;
  fate: Prisma.JsonValue | null;
  aspects: Prisma.JsonValue | null;
  skills: Prisma.JsonValue | null;
  stunts: Prisma.JsonValue | null;
  extras: Prisma.JsonValue | null;
  stress: Prisma.JsonValue | null;
  consequences: Prisma.JsonValue | null;
  notes: unknown[] | null;
  public: boolean;
  visibleTo: string[] | null;
  ownerId: string | null;
  created: Date;
  updated: Date;
};

const defaultColorPalette = () => ({
  primary: '209 213 219',
  secondary: '156 163 175',
  tertiary: '107 114 128',
});

const defaultStress = () => ({
  physical: { boxes: [false, false], visibleIn: [] as string[] },
  mental: { boxes: [false, false], visibleIn: [] as string[] },
});

const defaultConsequences = () => ({
  mild: { name: '', visibleIn: [] as string[] },
  moderate: { name: '', visibleIn: [] as string[] },
  severe: { name: '', visibleIn: [] as string[] },
});

const normalizeVisibleIn = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : [];

const normalizeAspects = (
  aspects: unknown,
): { name: string; visibleIn: string[] }[] => {
  const list = Array.isArray(aspects)
    ? aspects
    : typeof aspects === 'object' && aspects !== null
      ? Object.values(aspects as Record<string, unknown>)
      : [];

  return list.map((aspect) => {
    let parsed = aspect as { name?: unknown; visibleIn?: unknown };
    if (typeof aspect === 'string') {
      try {
        parsed = JSON.parse(aspect) as { name?: unknown; visibleIn?: unknown };
      } catch {
        parsed = { name: aspect };
      }
    }
    const name =
      typeof parsed?.name === 'string'
        ? parsed.name
        : parsed?.name
          ? String(parsed.name)
          : '';
    const visibleIn = normalizeVisibleIn(parsed?.visibleIn);
    return { name, visibleIn };
  });
};

const defaultName = () => ({ text: '', visibleIn: [] as string[] });
const defaultFate = () => ({
  points: 0,
  refresh: 0,
  visibleIn: [] as string[],
});

const mapCharacterSheet = (
  row?: CharacterSheetRow | null,
): CharacterSheetT | null =>
  row
    ? {
        _id: row.id,
        icon: (row.icon as CharacterSheetT['icon']) ?? undefined,
        colorPalette:
          (row.colorPalette as CharacterSheetT['colorPalette']) ??
          defaultColorPalette(),
        name: (row.name as CharacterSheetT['name']) ?? defaultName(),
        description:
          (row.description as CharacterSheetT['description']) ?? undefined,
        fate: (row.fate as CharacterSheetT['fate']) ?? defaultFate(),
        aspects: (row.aspects as CharacterSheetT['aspects']) ?? [],
        skills: (row.skills as CharacterSheetT['skills']) ?? {},
        stunts: (row.stunts as CharacterSheetT['stunts']) ?? [],
        extras: (row.extras as CharacterSheetT['extras']) ?? [],
        stress: (row.stress as CharacterSheetT['stress']) ?? defaultStress(),
        consequences:
          (row.consequences as CharacterSheetT['consequences']) ??
          defaultConsequences(),
        notes: (row.notes as CharacterSheetT['notes']) ?? [],
        public: row.public ?? false,
        visibleTo: row.visibleTo ?? [],
        owner: row.ownerId ?? '',
        created: row.created,
        updated: row.updated,
      }
    : null;

export async function createCharacterSheet(sheet: Partial<CharacterSheetT>) {
  const now = new Date();
  const id = sheet._id || randomUUID();
  const aspects = normalizeAspects(sheet.aspects);
  const visibleTo =
    sheet.visibleTo && Array.isArray(sheet.visibleTo) ? sheet.visibleTo : [];
  const created = await prisma.characterSheet.create({
    data: {
      id,
      icon: (sheet.icon as Prisma.InputJsonValue) ?? null,
      colorPalette:
        (sheet.colorPalette as Prisma.InputJsonValue) ?? defaultColorPalette(),
      name: (sheet.name as Prisma.InputJsonValue) ?? defaultName(),
      description: (sheet.description as Prisma.InputJsonValue) ?? null,
      fate: (sheet.fate as Prisma.InputJsonValue) ?? defaultFate(),
      aspects: aspects as Prisma.InputJsonValue,
      skills: (sheet.skills as Prisma.InputJsonValue) ?? {},
      stunts: (sheet.stunts as Prisma.InputJsonValue) ?? [],
      extras: (sheet.extras as Prisma.InputJsonValue) ?? [],
      stress: (sheet.stress as Prisma.InputJsonValue) ?? defaultStress(),
      consequences:
        (sheet.consequences as Prisma.InputJsonValue) ?? defaultConsequences(),
      notes: (sheet.notes as Prisma.InputJsonValue) ?? [],
      public: sheet.public ?? false,
      visibleTo,
      ownerId: sheet.owner ?? null,
      created: sheet.created ?? now,
      updated: sheet.updated ?? now,
    },
  });
  return mapCharacterSheet(created as CharacterSheetRow);
}

export async function getCharacterSheet(sheetId: string) {
  const sheet = await prisma.characterSheet.findUnique({
    where: { id: sheetId },
  });
  return mapCharacterSheet(sheet as CharacterSheetRow | null);
}

export async function getCharacterSheets(userId: string) {
  const rows = await prisma.characterSheet.findMany({
    where: { ownerId: userId },
  });
  return rows
    .map((row) => mapCharacterSheet(row as CharacterSheetRow))
    .filter(Boolean) as CharacterSheetT[];
}

export async function getCharacterSheetsByIds(ids: string[]) {
  if (!ids.length) return [];
  const rows = await prisma.characterSheet.findMany({
    where: { id: { in: ids } },
  });
  return rows
    .map((row) => mapCharacterSheet(row as CharacterSheetRow))
    .filter(Boolean) as CharacterSheetT[];
}

export async function updateCharacterSheet(
  sheetId: string,
  updates: Partial<CharacterSheetT>,
) {
  const data: Prisma.CharacterSheetUncheckedUpdateInput = {
    updated: new Date(),
  };

  if (updates.icon !== undefined)
    data.icon = updates.icon as Prisma.InputJsonValue;
  if (updates.colorPalette !== undefined)
    data.colorPalette = updates.colorPalette as Prisma.InputJsonValue;
  if (updates.name !== undefined)
    data.name = updates.name as Prisma.InputJsonValue;
  if (updates.description !== undefined)
    data.description = updates.description as Prisma.InputJsonValue;
  if (updates.fate !== undefined)
    data.fate = updates.fate as Prisma.InputJsonValue;
  if (updates.aspects !== undefined)
    data.aspects = normalizeAspects(updates.aspects) as Prisma.InputJsonValue;
  if (updates.skills !== undefined)
    data.skills = updates.skills as Prisma.InputJsonValue;
  if (updates.stunts !== undefined)
    data.stunts = updates.stunts as Prisma.InputJsonValue;
  if (updates.extras !== undefined)
    data.extras = updates.extras as Prisma.InputJsonValue;
  if (updates.stress !== undefined)
    data.stress = updates.stress as Prisma.InputJsonValue;
  if (updates.consequences !== undefined)
    data.consequences = updates.consequences as Prisma.InputJsonValue;
  if (updates.notes !== undefined)
    data.notes = updates.notes as Prisma.InputJsonValue;
  if (updates.public !== undefined) data.public = updates.public;
  if (updates.visibleTo !== undefined)
    data.visibleTo = Array.isArray(updates.visibleTo) ? updates.visibleTo : [];
  if (updates.owner !== undefined) data.ownerId = updates.owner;

  const updatedSheet = await prisma.characterSheet.update({
    where: { id: sheetId },
    data,
  });
  return mapCharacterSheet(updatedSheet as CharacterSheetRow);
}

export async function deleteCharacterSheet(sheetId: string) {
  await prisma.characterSheet.delete({ where: { id: sheetId } });
}
