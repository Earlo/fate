import { query } from '@/lib/postgres';
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
  icon: Record<string, unknown> | null;
  color_palette: Record<string, unknown> | null;
  name: Record<string, unknown>;
  description: Record<string, unknown> | null;
  fate: Record<string, unknown> | null;
  aspects: unknown[] | null;
  skills: Record<string, unknown> | null;
  stunts: unknown[] | null;
  extras: unknown[] | null;
  stress: Record<string, unknown> | null;
  consequences: Record<string, unknown> | null;
  notes: unknown[] | null;
  public: boolean;
  visible_to: string[] | null;
  owner: string;
  created: Date;
  updated: Date;
};

const sheetFields = `
  id,
  icon,
  color_palette,
  name,
  description,
  fate,
  aspects,
  skills,
  stunts,
  extras,
  stress,
  consequences,
  notes,
  public,
  visible_to,
  owner,
  created,
  updated
`;

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
const toJsonText = (value: unknown) => JSON.stringify(value ?? null);

const mapCharacterSheet = (
  row?: CharacterSheetRow | null,
): CharacterSheetT | null =>
  row
    ? {
        _id: row.id,
        icon: (row.icon as CharacterSheetT['icon']) ?? undefined,
        colorPalette:
          (row.color_palette as CharacterSheetT['colorPalette']) ??
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
        visibleTo: row.visible_to ?? [],
        owner: row.owner,
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
  const { rows } = await query<CharacterSheetRow>(
    `
      INSERT INTO character_sheets (
        id,
        icon,
        color_palette,
        name,
        description,
        fate,
        aspects,
        skills,
        stunts,
        extras,
        stress,
        consequences,
        notes,
        public,
        visible_to,
        owner,
        created,
        updated
      )
      VALUES (
        $1,
        CAST($2 AS jsonb),
        CAST($3 AS jsonb),
        CAST($4 AS jsonb),
        CAST($5 AS jsonb),
        CAST($6 AS jsonb),
        CAST($7 AS jsonb),
        CAST($8 AS jsonb),
        CAST($9 AS jsonb),
        CAST($10 AS jsonb),
        CAST($11 AS jsonb),
        CAST($12 AS jsonb),
        CAST($13 AS jsonb),
        COALESCE($14, false),
        $15,
        $16,
        $17,
        $18
      )
      RETURNING ${sheetFields}
    `,
    [
      id,
      toJsonText(sheet.icon ?? null),
      toJsonText(sheet.colorPalette ?? defaultColorPalette()),
      toJsonText(sheet.name ?? defaultName()),
      toJsonText(sheet.description ?? null),
      toJsonText(sheet.fate ?? defaultFate()),
      toJsonText(aspects),
      toJsonText(sheet.skills ?? {}),
      toJsonText(sheet.stunts ?? []),
      toJsonText(sheet.extras ?? []),
      toJsonText(sheet.stress ?? defaultStress()),
      toJsonText(sheet.consequences ?? defaultConsequences()),
      toJsonText(sheet.notes ?? []),
      sheet.public ?? false,
      visibleTo,
      sheet.owner,
      sheet.created ?? now,
      sheet.updated ?? now,
    ],
  );
  return mapCharacterSheet(rows[0]);
}

export async function getCharacterSheet(sheetId: string) {
  const { rows } = await query<CharacterSheetRow>(
    `SELECT ${sheetFields} FROM character_sheets WHERE id = $1`,
    [sheetId],
  );
  return mapCharacterSheet(rows[0]);
}

export async function getCharacterSheets(userId: string) {
  const { rows } = await query<CharacterSheetRow>(
    `SELECT ${sheetFields} FROM character_sheets WHERE owner = $1`,
    [userId],
  );
  return rows
    .map((row) => mapCharacterSheet(row))
    .filter(Boolean) as CharacterSheetT[];
}

export async function getCharacterSheetsByIds(ids: string[]) {
  if (!ids.length) return [];
  const { rows } = await query<CharacterSheetRow>(
    `SELECT ${sheetFields} FROM character_sheets WHERE id = ANY($1::text[])`,
    [ids],
  );
  return rows
    .map((row) => mapCharacterSheet(row))
    .filter(Boolean) as CharacterSheetT[];
}

export async function updateCharacterSheet(
  sheetId: string,
  updates: Partial<CharacterSheetT>,
) {
  const columns: Partial<Record<keyof CharacterSheetT, string>> = {
    icon: 'icon',
    colorPalette: 'color_palette',
    name: 'name',
    description: 'description',
    fate: 'fate',
    aspects: 'aspects',
    skills: 'skills',
    stunts: 'stunts',
    extras: 'extras',
    stress: 'stress',
    consequences: 'consequences',
    notes: 'notes',
    public: 'public',
    visibleTo: 'visible_to',
    owner: 'owner',
  };

  const values: unknown[] = [new Date()];
  const setStatements = ['updated = $1'];
  let index = 2;
  for (const [key, column] of Object.entries(columns)) {
    const updateValue = updates[key as keyof CharacterSheetT];
    if (updateValue !== undefined) {
      const valueToUse =
        column === 'visible_to' && !Array.isArray(updateValue)
          ? []
          : column === 'aspects'
            ? normalizeAspects(updateValue)
            : updateValue;
      const needsJsonCast =
        column &&
        [
          'icon',
          'color_palette',
          'name',
          'description',
          'fate',
          'aspects',
          'skills',
          'stunts',
          'extras',
          'stress',
          'consequences',
          'notes',
        ].includes(column);
      setStatements.push(
        `${column} = ${needsJsonCast ? `CAST($${index} AS jsonb)` : `$${index}`}`,
      );
      values.push(needsJsonCast ? toJsonText(valueToUse) : valueToUse);
      index += 1;
    }
  }

  const { rows } = await query<CharacterSheetRow>(
    `
      UPDATE character_sheets
      SET ${setStatements.join(', ')}
      WHERE id = $${index}
      RETURNING ${sheetFields}
    `,
    [...values, sheetId],
  );
  return mapCharacterSheet(rows[0]);
}

export async function deleteCharacterSheet(sheetId: string) {
  await query(`DELETE FROM character_sheets WHERE id = $1`, [sheetId]);
}
