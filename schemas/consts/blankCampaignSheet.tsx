import { CampaignT, PopulatedCampaignT } from '@/schemas/campaign';
import {
  blankAspects,
  defaultGroupDimensions,
  defaultPalette,
} from './blankDefaults';

export const defaultSkills = (): CampaignT['skills'] => [
  {
    name: 'Athletics',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Burglary',
    actions: ['overcome', 'advantage'],
  },
  {
    name: 'Contacts',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Crafts',
    actions: ['overcome', 'advantage'],
  },
  {
    name: 'Deceive',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Drive',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Empathy',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Fight',
    actions: ['overcome', 'advantage', 'attack', 'defend'],
  },
  {
    name: 'Investigate',
    actions: ['overcome', 'advantage'],
  },
  {
    name: 'Lore',
    actions: ['overcome', 'advantage'],
  },
  {
    name: 'Notice',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Physique',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Provoke',
    actions: ['overcome', 'advantage', 'attack'],
  },
  {
    name: 'Rapport',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Resources',
    actions: ['overcome', 'advantage'],
  },
  {
    name: 'Shoot',
    actions: ['overcome', 'advantage', 'attack'],
  },
  {
    name: 'Stealth',
    actions: ['overcome', 'advantage', 'defend'],
  },
  {
    name: 'Will',
    actions: ['overcome', 'advantage', 'defend'],
  },
];

export const blankCampaignSheet = (): Omit<CampaignT, 'id'> => ({
  name: '',
  description: '',
  colorPalette: defaultPalette(),
  aspects: blankAspects(),
  skills: defaultSkills(),
  groups: [],
  notes: [],
  public: false,
  visibleTo: [],
  owner: '',
});

export const blankGroup = (): Omit<PopulatedCampaignT['groups'][0], 'id'> => ({
  name: 'New Group',
  description: '',
  icon: {
    url: '',
    note: '',
  },
  colorPalette: defaultPalette(),
  public: false,
  visible: true,
  layout: {
    mode: 'list',
    dimensions: defaultGroupDimensions(),
    backgroundImage: '',
  },
  characters: [],
  children: [],
});
