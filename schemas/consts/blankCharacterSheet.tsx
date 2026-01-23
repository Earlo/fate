import { CharacterSheetT } from '@/schemas/sheet';
import {
  blankAspects,
  defaultConsequences,
  defaultPalette,
  defaultStress,
} from './blankDefaults';

export const blankCharacterSheet = (): CharacterSheetT => ({
  colorPalette: defaultPalette(),
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
  aspects: blankAspects(),
  skills: {},
  stunts: [],
  extras: [],
  stress: defaultStress(),
  consequences: defaultConsequences(),
  notes: [],
  public: false,
  visibleTo: [],
  owner: '',
  id: '',
});
