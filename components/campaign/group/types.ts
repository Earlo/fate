import { PopulatedGroup } from '@/schemas/campaign';
import { CharacterSheetT } from '@/schemas/sheet';

export type GroupState = 'admin' | 'player' | 'view';

export type GroupCharacter = {
  sheet: CharacterSheetT;
  visible: boolean;
  position: { x: number; y: number };
};

export type GroupProps = {
  group: PopulatedGroup;
  state: GroupState;
  onChange: (updatedGroup?: PopulatedGroup) => void;
  campaignId: string;
};

export type GroupLayoutProps = {
  characters: GroupCharacter[];
  campaignId: string;
  state: GroupState;
  onReorder: (characters: GroupCharacter[]) => void;
};
