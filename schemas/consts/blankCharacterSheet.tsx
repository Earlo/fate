import { CharacterSheetT } from '@/schemas/sheet';

export const blankSheet: Omit<CharacterSheetT, '_id'> = {
  colorPalette: {
    primary: '209 213 219',
    secondary: '156 163 175',
    tertiary: '107 114 128',
  },
  name: {
    text: '',
    visibleIn: [],
  },
  description: {
    text: '',
    visibleIn: [],
  },
  aspects: [
    {
      name: '',
      visibleIn: [],
    },
    {
      name: '',
      visibleIn: [],
    },
    {
      name: '',
      visibleIn: [],
    },
    {
      name: '',
      visibleIn: [],
    },
    {
      name: '',
      visibleIn: [],
    },
  ],
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
  controlledBy: '',
};
