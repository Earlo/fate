import { userContext } from '@/app/userProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { defaultGroupDimensions } from '@/schemas/consts/blankDefaults';
import { MouseEvent, useContext, useState } from 'react';
import { GroupProps } from './types';

const GroupMemberMenu = ({ group, state, onChange }: GroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { sheets } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  const layout = group.layout?.mode || 'list';
  const layoutDimensions = group.layout?.dimensions ?? defaultGroupDimensions();

  const findNextAvailablePosition = () => {
    const occupied = new Set(
      group.characters.map(
        (character) => `${character.position.x},${character.position.y}`,
      ),
    );

    for (let y = 0; ; y += 1) {
      for (let x = 0; x < layoutDimensions.w; x += 1) {
        if (!occupied.has(`${x},${y}`)) return { x, y };
      }
    }
  };

  const toggleCharacter = (characterId: string) => {
    const characterIndex = group.characters.findIndex(
      (character) => character.sheet.id === characterId,
    );
    const characters = [...group.characters];
    if (characterIndex > -1) {
      characters.splice(characterIndex, 1);
      onChange({ ...group, characters });
      return;
    }

    const character = sheets.find((sheet) => sheet.id === characterId);
    if (!character) return;
    const position =
      layout === 'grid'
        ? findNextAvailablePosition()
        : { x: 0, y: characters.length };
    const dimensions = { ...layoutDimensions };
    if (position.y >= dimensions.h) dimensions.h = position.y + 1;
    characters.push({ sheet: character, visible: true, position });
    onChange({
      ...group,
      characters,
      layout:
        layout === 'grid'
          ? { ...(group.layout ?? { mode: 'grid' }), dimensions }
          : group.layout,
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {((group.public && isPlayer) || isAdmin) && (
        <DropdownMenuTrigger asChild>
          <button
            className="absolute right-2 bottom-2 size-12 rounded-full bg-blue-600 font-bold text-stone-100 hover:bg-blue-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '-' : '+'}
          </button>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent className="bg-slate-600">
        {sheets.length > 0 ? (
          sheets.map((character) => (
            <DropdownMenuItem
              key={character.id}
              onClick={(event: MouseEvent<HTMLDivElement>) => {
                event.preventDefault();
                toggleCharacter(character.id);
              }}
              className="flex cursor-pointer items-center px-2 py-1 hover:bg-slate-700"
            >
              <input
                type="checkbox"
                checked={group.characters.some(
                  (groupCharacter) => groupCharacter.sheet.id === character.id,
                )}
                readOnly
                className="mr-2"
              />
              {character.name.text}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuLabel>
            {"You haven't created any characters yet"}
          </DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GroupMemberMenu;
