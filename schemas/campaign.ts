import { query } from '@/lib/postgres';
import { getCharacterSheetsByIds, type CharacterSheetT } from '@/schemas/sheet';
import { getUserById } from '@/schemas/user';
import { randomUUID } from 'crypto';

export type SkillAction = 'overcome' | 'advantage' | 'attack' | 'defend';

export type GroupCharacter =
  | {
      sheet: string;
      visible: boolean;
      position: { x: number; y: number };
    }
  | {
      sheet: CharacterSheetT;
      visible: boolean;
      position: { x: number; y: number };
    };

export type GroupT = {
  _id?: string;
  name: string;
  description: string;
  icon?: { url: string; note?: string };
  colorPalette: { primary: string; secondary: string; tertiary: string };
  characters: GroupCharacter[];
  layout?: {
    mode: 'list' | 'grid';
    dimensions: { w: number; h: number };
  };
  children: GroupT[];
  visible: boolean;
  public: boolean;
};

export type CampaignT = {
  _id: string;
  name: string;
  icon?: { url: string; note?: string };
  description?: string;
  colorPalette: { primary: string; secondary: string; tertiary: string };
  aspects: { name: string; visibleIn: string[] }[];
  skills: { name: string; actions: SkillAction[] }[];
  groups: GroupT[];
  public: boolean;
  notes: { name: string; content: string; visibleIn: string[] }[];
  visibleTo: string[];
  owner: string;
  created?: Date;
  updated?: Date;
};

export type PopulatedGroup = Omit<GroupT, 'characters' | 'children'> & {
  _id?: string;
  characters: {
    sheet: CharacterSheetT;
    visible: boolean;
    position: { x: number; y: number };
  }[];
  children: PopulatedGroup[];
};

export type PopulatedCampaignT = Omit<CampaignT, 'groups'> & {
  groups: PopulatedGroup[];
};

type CampaignRow = {
  id: string;
  name: string;
  icon: Record<string, unknown> | null;
  description: string | null;
  color_palette: Record<string, unknown> | null;
  aspects: unknown[] | null;
  skills: unknown[] | null;
  groups: unknown[] | null;
  public: boolean;
  notes: unknown[] | null;
  visible_to: string[] | null;
  owner: string;
  created: Date;
  updated: Date;
};

const campaignFields = `
  id,
  name,
  icon,
  description,
  color_palette,
  aspects,
  skills,
  groups,
  public,
  notes,
  visible_to,
  owner,
  created,
  updated
`;

const defaultColorPalette = {
  primary: '209 213 219',
  secondary: '156 163 175',
  tertiary: '107 114 128',
};

const toJsonText = (value: unknown) => JSON.stringify(value ?? null);

const mapCampaign = (row?: CampaignRow | null): CampaignT | null =>
  row
    ? {
        _id: row.id,
        name: row.name,
        icon: (row.icon as CampaignT['icon']) ?? undefined,
        description: row.description ?? undefined,
        colorPalette:
          (row.color_palette as CampaignT['colorPalette']) ??
          defaultColorPalette,
        aspects: (row.aspects as CampaignT['aspects']) ?? [],
        skills: (row.skills as CampaignT['skills']) ?? [],
        groups: (row.groups as CampaignT['groups']) ?? [],
        public: row.public ?? false,
        notes: (row.notes as CampaignT['notes']) ?? [],
        visibleTo: row.visible_to ?? [],
        owner: row.owner,
        created: row.created,
        updated: row.updated,
      }
    : null;

const normalizeGroups = (
  groups: (GroupT | PopulatedGroup)[] | null | undefined,
): GroupT[] =>
  (groups ?? []).map((group) => ({
    _id: group._id ?? randomUUID(),
    ...group,
    characters:
      group.characters?.map((character) => ({
        ...character,
        sheet:
          typeof character.sheet === 'string'
            ? character.sheet
            : character.sheet._id,
      })) ?? [],
    children: normalizeGroups(group.children),
  }));

const collectCharacterIds = (groups: GroupT[]): string[] => {
  const ids = new Set<string>();
  const walk = (groupList: GroupT[]) => {
    groupList.forEach((group) => {
      group.characters?.forEach((character) => {
        if (typeof character.sheet === 'string') {
          ids.add(character.sheet);
        }
      });
      if (group.children?.length) {
        walk(group.children);
      }
    });
  };
  walk(groups);
  return Array.from(ids);
};

const populateGroups = (
  groups: GroupT[],
  sheetMap: Map<string, CharacterSheetT>,
): PopulatedGroup[] =>
  groups.map((group) => ({
    ...group,
    characters:
      group.characters
        ?.map((character) => {
          const sheetId =
            typeof character.sheet === 'string'
              ? character.sheet
              : character.sheet._id;
          const sheet = sheetMap.get(sheetId);
          if (!sheet) return null;
          return { ...character, sheet };
        })
        .filter(
          (character): character is Exclude<typeof character, null> =>
            character !== null,
        ) ?? [],
    children: populateGroups(group.children ?? [], sheetMap),
  }));

const buildCampaignUpdate = (updates: Partial<CampaignT>) => {
  const columns: Partial<Record<keyof CampaignT, string>> = {
    name: 'name',
    icon: 'icon',
    description: 'description',
    colorPalette: 'color_palette',
    aspects: 'aspects',
    skills: 'skills',
    groups: 'groups',
    public: 'public',
    notes: 'notes',
    visibleTo: 'visible_to',
    owner: 'owner',
  };

  const setStatements = ['updated = $1'];
  const values: unknown[] = [new Date()];
  let index = 2;

  const jsonColumns: (keyof CampaignT)[] = [
    'icon',
    'colorPalette',
    'aspects',
    'skills',
    'groups',
    'notes',
  ];

  for (const [key, column] of Object.entries(columns)) {
    const value = updates[key as keyof CampaignT];
    if (value !== undefined) {
      const isJsonColumn = jsonColumns.includes(key as keyof CampaignT);
      const normalizedValue =
        key === 'groups' ? normalizeGroups(value as GroupT[]) : value;

      setStatements.push(
        `${column} = ${
          isJsonColumn ? `CAST($${index} AS jsonb)` : `$${index}`
        }`,
      );
      values.push(
        isJsonColumn ? toJsonText(normalizedValue) : normalizedValue,
      );
      index += 1;
    }
  }

  return { setStatements, values, nextIndex: index };
};

export async function createCampaign(
  campaign: Partial<CampaignT> | Partial<PopulatedCampaignT>,
) {
  const now = new Date();
  const id = campaign._id || randomUUID();

  const groups = normalizeGroups(
    (campaign as CampaignT | PopulatedCampaignT).groups ?? [],
  );

  const { rows } = await query<CampaignRow>(
    `
      INSERT INTO campaigns (
        id,
        name,
        icon,
        description,
        color_palette,
        aspects,
        skills,
        groups,
        public,
        notes,
        visible_to,
        owner,
        created,
        updated
      )
      VALUES (
        $1,
        $2,
        CAST($3 AS jsonb),
        $4,
        CAST($5 AS jsonb),
        CAST($6 AS jsonb),
        CAST($7 AS jsonb),
        CAST($8 AS jsonb),
        COALESCE($9, false),
        CAST($10 AS jsonb),
        $11,
        $12,
        $13,
        $14
      )
      RETURNING ${campaignFields}
    `,
    [
      id,
      campaign.name,
      toJsonText(campaign.icon ?? null),
      campaign.description ?? null,
      toJsonText(campaign.colorPalette ?? defaultColorPalette),
      toJsonText(campaign.aspects ?? []),
      toJsonText(campaign.skills ?? []),
      toJsonText(groups),
      campaign.public ?? false,
      toJsonText(campaign.notes ?? []),
      campaign.visibleTo ?? [],
      campaign.owner,
      campaign.created ?? now,
      campaign.updated ?? now,
    ],
  );

  const mapped = mapCampaign(rows[0]);
  if (!mapped) return null;
  return getCampaign(mapped._id);
}

export async function getCampaign(id: string) {
  const { rows } = await query<CampaignRow>(
    `SELECT ${campaignFields} FROM campaigns WHERE id = $1`,
    [id],
  );
  const baseCampaign = mapCampaign(rows[0]);
  if (!baseCampaign) return null;

  const sheetIds = collectCharacterIds(baseCampaign.groups);
  const sheets = await getCharacterSheetsByIds(sheetIds);
  const sheetMap = new Map(sheets.map((sheet) => [sheet._id, sheet] as const));

  return {
    ...baseCampaign,
    groups: populateGroups(baseCampaign.groups ?? [], sheetMap),
  } as PopulatedCampaignT;
}

export async function updateCampaign(
  id: string,
  updates: Partial<CampaignT>,
): Promise<CampaignT | null> {
  const normalizedUpdates: Partial<CampaignT> = { ...updates };
  if ((updates as CampaignT | PopulatedCampaignT).groups !== undefined) {
    normalizedUpdates.groups = normalizeGroups(
      (updates as CampaignT | PopulatedCampaignT).groups,
    );
  }

  const { setStatements, values, nextIndex } =
    buildCampaignUpdate(normalizedUpdates);

  const { rows } = await query<CampaignRow>(
    `
      UPDATE campaigns
      SET ${setStatements.join(', ')}
      WHERE id = $${nextIndex}
      RETURNING ${campaignFields}
    `,
    [...values, id],
  );

  const mapped = mapCampaign(rows[0]);
  if (!mapped) return null;
  return mapped;
}

export const getCampaigns = async (
  userId: string,
): Promise<PopulatedCampaignT[]> => {
  const user = await getUserById(userId);
  const isAdmin = user?.admin ?? false;

  const visibilityFilter = isAdmin
    ? ''
    : `WHERE public = true OR $1 = ANY(visible_to) OR owner = $1`;

  const { rows } = await query<CampaignRow>(
    `SELECT ${campaignFields} FROM campaigns ${visibilityFilter}`,
    isAdmin ? [] : [userId],
  );

  const campaigns = rows
    .map((row) => mapCampaign(row))
    .filter(Boolean) as CampaignT[];

  const allSheetIds = campaigns.flatMap((campaign) =>
    collectCharacterIds(campaign.groups),
  );
  const uniqueSheetIds = Array.from(new Set(allSheetIds));
  const sheets = await getCharacterSheetsByIds(uniqueSheetIds);
  const sheetMap = new Map(sheets.map((sheet) => [sheet._id, sheet] as const));

  return campaigns.map(
    (campaign) =>
      ({
        ...campaign,
        groups: populateGroups(campaign.groups ?? [], sheetMap),
      }) as PopulatedCampaignT,
  );
};
