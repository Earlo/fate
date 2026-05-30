import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { CharacterSheetT } from './sheet';

vi.mock('@/lib/prisma', () => ({ prisma: {} }));

let getCampaignVisibleCharacterSheet: (
  sheet: CharacterSheetT,
  campaignId: string,
) => CharacterSheetT;

beforeAll(async () => {
  ({ getCampaignVisibleCharacterSheet } = await import('./sheet'));
});

const campaignId = 'campaign-visible';
const otherCampaignId = 'campaign-hidden';
const visibleIn = [campaignId];
const hiddenIn = [otherCampaignId];

const sheet = (): CharacterSheetT => ({
  id: 'sheet-1',
  owner: 'owner-1',
  public: false,
  visibleTo: ['private-viewer'],
  colorPalette: { primary: '1', secondary: '2', tertiary: '3' },
  icon: { url: '/portrait.png', visibleIn: hiddenIn },
  name: { text: 'Hidden Name', visibleIn: hiddenIn },
  description: { text: 'Visible description', visibleIn },
  fate: { points: 5, refresh: 3, visibleIn: hiddenIn },
  aspects: [
    { name: 'Visible aspect', visibleIn },
    { name: 'Hidden aspect', visibleIn: hiddenIn },
  ],
  skills: {
    3: [
      { name: 'Visible skill', visibleIn },
      { name: 'Hidden skill', visibleIn: hiddenIn },
    ],
  },
  stunts: [
    { name: 'Visible stunt', description: 'Shown', visibleIn },
    { name: 'Hidden stunt', description: 'Secret', visibleIn: hiddenIn },
  ],
  extras: [
    { name: 'Hidden extra', description: 'Secret', visibleIn: hiddenIn },
  ],
  stress: {
    physical: { boxes: [true, false], visibleIn },
    mental: { boxes: [true, true], visibleIn: hiddenIn },
  },
  consequences: {
    mild: { name: 'Visible consequence', visibleIn },
    moderate: { name: 'Hidden consequence', visibleIn: hiddenIn },
    severe: { name: 'Hidden consequence', visibleIn: hiddenIn },
  },
  notes: [
    { name: 'Visible note', content: 'Shown', visibleIn },
    { name: 'Hidden note', content: 'Secret', visibleIn: hiddenIn },
  ],
});

describe('getCampaignVisibleCharacterSheet', () => {
  it('keeps campaign-visible fields and redacts hidden fields', () => {
    const projected = getCampaignVisibleCharacterSheet(sheet(), campaignId);

    expect(projected.icon).toBeUndefined();
    expect(projected.name).toEqual({ text: '', visibleIn: [] });
    expect(projected.description?.text).toBe('Visible description');
    expect(projected.fate).toEqual({ points: 0, refresh: 0, visibleIn: [] });
    expect(projected.aspects.map(({ name }) => name)).toEqual([
      'Visible aspect',
    ]);
    expect(projected.skills[3].map(({ name }) => name)).toEqual([
      'Visible skill',
    ]);
    expect(projected.stunts.map(({ name }) => name)).toEqual(['Visible stunt']);
    expect(projected.extras).toEqual([]);
    expect(projected.stress.physical.boxes).toEqual([true, false]);
    expect(projected.stress.mental).toEqual({ boxes: [], visibleIn: [] });
    expect(projected.consequences.mild.name).toBe('Visible consequence');
    expect(projected.consequences.moderate.name).toBe('');
    expect(projected.notes.map(({ name }) => name)).toEqual(['Visible note']);
    expect(projected.visibleTo).toEqual([]);
  });
});
