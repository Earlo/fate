import { prisma } from '@/lib/prisma';
import { getCharacterSheetsByIds, type CharacterSheetT } from '@/schemas/sheet';
import { getUserById } from '@/schemas/user';
import { Prisma } from '@prisma/client';
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
  id?: string;
  name: string;
  description: string;
  icon?: { url: string; note?: string };
  colorPalette: { primary: string; secondary: string; tertiary: string };
  characters: GroupCharacter[];
  layout?: {
    mode: 'list' | 'grid';
    dimensions: { w: number; h: number };
    backgroundImage?: string;
  };
  children: GroupT[];
  visible: boolean;
  public: boolean;
};

export type CampaignT = {
  id: string;
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
  id?: string;
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
  icon: Prisma.JsonValue | null;
  description: string | null;
  colorPalette: Prisma.JsonValue | null;
  aspects: Prisma.JsonValue | null;
  skills: Prisma.JsonValue | null;
  groups: Prisma.JsonValue | null;
  public: boolean;
  notes: Prisma.JsonValue | null;
  visibleTo: string[] | null;
  ownerId: string | null;
  created: Date;
  updated: Date;
};

const defaultColorPalette = {
  primary: '209 213 219',
  secondary: '156 163 175',
  tertiary: '107 114 128',
};

const mapCampaign = (row?: CampaignRow | null): CampaignT | null =>
  row
    ? {
        id: row.id,
        name: row.name,
        icon: (row.icon as CampaignT['icon']) ?? undefined,
        description: row.description ?? undefined,
        colorPalette:
          (row.colorPalette as CampaignT['colorPalette']) ??
          defaultColorPalette,
        aspects: (row.aspects as CampaignT['aspects']) ?? [],
        skills: (row.skills as CampaignT['skills']) ?? [],
        groups: (row.groups as CampaignT['groups']) ?? [],
        public: row.public ?? false,
        notes: (row.notes as CampaignT['notes']) ?? [],
        visibleTo: row.visibleTo ?? [],
        owner: row.ownerId ?? '',
        created: row.created,
        updated: row.updated,
      }
    : null;

const normalizeGroups = (
  groups: (GroupT | PopulatedGroup)[] | null | undefined,
): GroupT[] =>
  (groups ?? []).map((group) => ({
    id: group.id ?? randomUUID(),
    ...group,
    characters:
      group.characters?.map((character) => ({
        ...character,
        sheet:
          typeof character.sheet === 'string'
            ? character.sheet
            : character.sheet.id,
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
              : character.sheet.id;
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
  const data: Prisma.CampaignUncheckedUpdateInput = {
    updated: new Date(),
  };

  if (updates.name !== undefined) data.name = updates.name;
  if (updates.icon !== undefined)
    data.icon = updates.icon as Prisma.InputJsonValue;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.colorPalette !== undefined)
    data.colorPalette = updates.colorPalette as Prisma.InputJsonValue;
  if (updates.aspects !== undefined)
    data.aspects = updates.aspects as Prisma.InputJsonValue;
  if (updates.skills !== undefined)
    data.skills = updates.skills as Prisma.InputJsonValue;
  if (updates.groups !== undefined)
    data.groups = normalizeGroups(
      (updates as CampaignT | PopulatedCampaignT).groups ?? [],
    ) as Prisma.InputJsonValue;
  if (updates.public !== undefined) data.public = updates.public;
  if (updates.notes !== undefined)
    data.notes = updates.notes as Prisma.InputJsonValue;
  if (updates.visibleTo !== undefined)
    data.visibleTo = Array.isArray(updates.visibleTo) ? updates.visibleTo : [];
  if (updates.owner !== undefined) data.ownerId = updates.owner;

  return data;
};

export async function createCampaign(
  campaign: Partial<CampaignT> | Partial<PopulatedCampaignT>,
) {
  const now = new Date();
  const id = campaign.id || randomUUID();

  const groups = normalizeGroups(
    (campaign as CampaignT | PopulatedCampaignT).groups ?? [],
  );

  const created = await prisma.campaign.create({
    data: {
      id,
      name: campaign.name ?? '',
      icon: (campaign.icon as Prisma.InputJsonValue) ?? null,
      description: campaign.description ?? null,
      colorPalette:
        (campaign.colorPalette as Prisma.InputJsonValue) ?? defaultColorPalette,
      aspects: (campaign.aspects as Prisma.InputJsonValue) ?? [],
      skills: (campaign.skills as Prisma.InputJsonValue) ?? [],
      groups: (groups as Prisma.InputJsonValue) ?? [],
      public: campaign.public ?? false,
      notes: (campaign.notes as Prisma.InputJsonValue) ?? [],
      visibleTo: campaign.visibleTo ?? [],
      ownerId: campaign.owner ?? null,
      created: campaign.created ?? now,
      updated: campaign.updated ?? now,
    },
  });

  const mapped = mapCampaign(created as CampaignRow);
  if (!mapped) return null;
  return getCampaign(mapped.id);
}

export async function getCampaign(id: string) {
  const row = await prisma.campaign.findUnique({ where: { id } });
  const baseCampaign = mapCampaign(row as CampaignRow | null);
  if (!baseCampaign) return null;

  const sheetIds = collectCharacterIds(baseCampaign.groups);
  const sheets = await getCharacterSheetsByIds(sheetIds);
  const sheetMap = new Map(sheets.map((sheet) => [sheet.id, sheet] as const));

  return {
    ...baseCampaign,
    groups: populateGroups(baseCampaign.groups ?? [], sheetMap),
  } as PopulatedCampaignT;
}

export async function updateCampaign(
  id: string,
  updates: Partial<CampaignT>,
): Promise<CampaignT | null> {
  const data = buildCampaignUpdate(updates);

  const row = await prisma.campaign.update({
    where: { id },
    data,
  });

  const mapped = mapCampaign(row as CampaignRow);
  if (!mapped) return null;
  return mapped;
}

export const getCampaigns = async (
  userId: string,
): Promise<PopulatedCampaignT[]> => {
  const user = await getUserById(userId);
  const isAdmin = user?.admin ?? false;

  const rows = await prisma.campaign.findMany({
    where: isAdmin
      ? undefined
      : {
          OR: [
            { public: true },
            { visibleTo: { has: userId } },
            { ownerId: userId },
          ],
        },
  });

  const campaigns = rows
    .map((row) => mapCampaign(row as CampaignRow))
    .filter(Boolean) as CampaignT[];

  const allSheetIds = campaigns.flatMap((campaign) =>
    collectCharacterIds(campaign.groups),
  );
  const uniqueSheetIds = Array.from(new Set(allSheetIds));
  const sheets = await getCharacterSheetsByIds(uniqueSheetIds);
  const sheetMap = new Map(sheets.map((sheet) => [sheet.id, sheet] as const));

  return campaigns.map(
    (campaign) =>
      ({
        ...campaign,
        groups: populateGroups(campaign.groups ?? [], sheetMap),
      }) as PopulatedCampaignT,
  );
};
