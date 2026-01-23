import { CharacterSheetT } from '@/schemas/sheet';
import { createBlankAspects, createDefaultColorPalette } from './blankDefaults';

export const blankSheet: CharacterSheetT = {
  colorPalette: createDefaultColorPalette(),
  name: {
    text: '',
    visibleIn: [],
  },
  description: {
    text: '',
    visibleIn: [],
  },
  fate: {
    points: 3,
    refresh: 3,
    visibleIn: [],
  },
  aspects: createBlankAspects(),
  skills: {},
  stunts: [],
  extras: [],
  stress: {
    physical: {
      boxes: [false, false],
      visibleIn: [],
    },
    mental: {
      boxes: [false, false],
      visibleIn: [],
    },
  },
  consequences: {
    mild: {
      name: '',
      visibleIn: [],
    },
    moderate: {
      name: '',
      visibleIn: [],
    },
    severe: {
      name: '',
      visibleIn: [],
    },
  },
  notes: [],
  public: false,
  visibleTo: [],
  owner: '',
  id: '',
};
