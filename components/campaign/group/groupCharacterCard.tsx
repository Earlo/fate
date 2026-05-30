import { userContext } from '@/app/userProvider';
import CharacterButton from '@/components/dashboard/characterButton';
import { getCharacterSheetById } from '@/lib/apiHelpers/sheets';
import { CharacterSheetT } from '@/schemas/sheet';
import { useSession } from 'next-auth/react';
import { ReactNode, useCallback, useContext } from 'react';
import { GroupState } from './types';

const useOpenCharacterSheet = (campaignId: string, state: GroupState) => {
  const { setBigSheet } = useContext(userContext);
  const { data: session } = useSession();

  return useCallback(
    async (sheet: CharacterSheetT) => {
      const isOwner = sheet.owner === session?.user?.id;
      const nextState =
        state === 'admin' || isOwner
          ? 'toggle'
          : state === 'player'
            ? 'play'
            : 'view';
      try {
        const updated = await getCharacterSheetById(sheet.id);
        setBigSheet({
          sheet: updated ?? sheet,
          state: nextState,
          campaignId,
        });
      } catch (error) {
        console.error('Failed to refresh character sheet', error);
        setBigSheet({ sheet, state: nextState, campaignId });
      }
    },
    [campaignId, session?.user?.id, setBigSheet, state],
  );
};

type GroupCharacterCardProps = {
  character: CharacterSheetT;
  campaignId: string;
  state: GroupState;
  compact?: boolean;
  dragHandle?: ReactNode;
};

const GroupCharacterCard = ({
  character,
  campaignId,
  state,
  compact,
  dragHandle,
}: GroupCharacterCardProps) => {
  const { bigSheet, smallSheets } = useContext(userContext);
  const { data: session } = useSession();
  const openCharacterSheet = useOpenCharacterSheet(campaignId, state);
  const isAdmin = state === 'admin';
  const isOwner = character.owner === session?.user?.id;
  const isOpen =
    bigSheet?.sheet?.id === character.id ||
    smallSheets.some((entry) => entry.sheet?.id === character.id);

  return (
    <CharacterButton
      compact={compact}
      character={character}
      isOwner={isOwner}
      disabled={isOpen}
      onClick={isOpen ? undefined : () => void openCharacterSheet(character)}
      campaignId={isAdmin || isOwner ? undefined : campaignId}
      dragHandle={dragHandle}
    />
  );
};

export default GroupCharacterCard;
