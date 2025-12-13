'use client';
import { userContext } from '@/app/userProvider';
import Button from '@/components/generic/button';
import Icon from '@/components/generic/icon/icon';
import IconButton from '@/components/generic/icon/iconButton';
import Modal from '@/components/generic/modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PopulatedGroup } from '@/schemas/campaign';
import { CharacterSheetT } from '@/schemas/sheet';
import {
  DragEvent,
  FC,
  Fragment,
  MouseEvent,
  useContext,
  useState,
} from 'react';
import LabeledInput from '../generic/labeledInput';
import ToggleSwitch from '../generic/toggleSwitch';
import VisibilityToggle from '../sheet/visibilityToggle';
import CharacterButton from './characterButton';

const GroupSettings: FC<{
  group: PopulatedGroup;
  onChange: (updatedGroup?: PopulatedGroup) => void;
  setIsEditing: (isEditing: boolean) => void;
}> = ({ group, onChange, setIsEditing }) => {
  const [newName, setNewName] = useState(group.name);
  const layoutDimensions = group.layout?.dimensions ?? { w: 3, h: 3 };
  const handleSave = () => {
    setIsEditing(false);
    const updatedGroup = { ...group, name: newName };
    onChange(updatedGroup);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(group.name);
  };

  const handleDelete = () => {
    setIsEditing(false);
    onChange();
  };

  const toggleProperty = (property: 'public' | 'visible') => {
    const updatedGroup = { ...group, [property]: !group[property] };
    onChange(updatedGroup);
  };

  return (
    <Modal
      onClose={() => setIsEditing(false)}
      className="mx-auto max-w-md rounded-lg bg-white shadow"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        Edit Group Settings
      </h2>
      <LabeledInput
        type="text"
        name="name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ToggleSwitch
            checked={group.visible}
            onChange={() => toggleProperty('visible')}
            label="Visible"
          />
          <ToggleSwitch
            checked={group.public}
            onChange={() => toggleProperty('public')}
            label="Public"
            className="ml-4"
          />
        </div>
      </div>
      <ToggleSwitch
        checked={group.layout?.mode === 'grid'}
        onChange={() => {
          const nextMode = group.layout?.mode === 'grid' ? 'list' : 'grid';
          const nextLayout =
            nextMode === 'grid'
              ? {
                  mode: 'grid' as const,
                  dimensions: group.layout?.dimensions ?? { w: 3, h: 3 },
                }
              : group.layout?.dimensions
                ? { mode: 'list' as const, dimensions: group.layout.dimensions }
                : undefined;
          onChange({ ...group, layout: nextLayout });
        }}
        label="Grid Layout"
      />
      {group.layout?.mode === 'grid' && (
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            type="number"
            name="width"
            value={layoutDimensions.w}
            onChange={(e) =>
              onChange({
                ...group,
                layout: {
                  mode: 'grid',
                  dimensions: {
                    ...layoutDimensions,
                    w: parseInt(e.target.value),
                  },
                },
              })
            }
          />
          <LabeledInput
            type="number"
            name="height"
            value={layoutDimensions.h}
            onChange={(e) =>
              onChange({
                ...group,
                layout: {
                  mode: 'grid',
                  dimensions: {
                    ...layoutDimensions,
                    h: parseInt(e.target.value),
                  },
                },
              })
            }
          />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button label="Cancel" onClick={handleCancel} />
        <Button label="Save" onClick={handleSave} />
        <Button label="Delete" onClick={handleDelete} />
      </div>
    </Modal>
  );
};

interface GroupProps {
  group: PopulatedGroup;
  state: 'admin' | 'player' | 'view';
  onChange: (updatedGroup?: PopulatedGroup) => void;
  campaignId: string;
}

const Group: FC<GroupProps> = ({ group, state, onChange, campaignId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { sheets } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  const layoutMode = group.layout?.mode || 'list';
  const layoutDimensions = group.layout?.dimensions ?? { w: 3, h: 3 };

  const findNextAvailablePosition = () => {
    const occupied = new Set(
      group.characters.map(
        (character) => `${character.position.x},${character.position.y}`,
      ),
    );

    for (let y = 0; ; y += 1) {
      for (let x = 0; x < layoutDimensions.w; x += 1) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) return { x, y };
      }
    }
  };

  const ensureLayoutFitsPosition = (x: number, y: number) => {
    if (layoutMode !== 'grid') return group.layout;
    const dimensions = { ...layoutDimensions };
    if (y >= dimensions.h) {
      dimensions.h = y + 1;
    }
    return { ...(group.layout ?? { mode: 'grid' }), dimensions };
  };

  const toggleCharacter = (characterId: string) => {
    const charIndex = group.characters.findIndex(
      (c) => c.sheet._id === characterId,
    );
    const updatedCharacters = [...group.characters];
    if (charIndex > -1) {
      updatedCharacters.splice(charIndex, 1);
    } else {
      const character = sheets.find((c) => c._id === characterId);
      if (character) {
        const nextPosition =
          layoutMode === 'grid'
            ? findNextAvailablePosition()
            : { x: 0, y: updatedCharacters.length };
        updatedCharacters.push({
          sheet: character,
          visible: true,
          position: nextPosition,
        });
        const updatedGroup = {
          ...group,
          characters: updatedCharacters,
          layout:
            layoutMode === 'grid'
              ? ensureLayoutFitsPosition(nextPosition.x, nextPosition.y)
              : group.layout,
        };
        onChange(updatedGroup);
        return;
      }
    }
    const updatedGroup = { ...group, characters: updatedCharacters };
    onChange(updatedGroup);
  };
  const layout = layoutMode;
  return (
    <div className="relative mx-auto flex min-h-24 w-full grow flex-col rounded-lg bg-gray-800 p-2 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-l font-bold">{group.name}</h1>
        {isAdmin && (
          <div className="flex">
            <VisibilityToggle
              visible={group.visible}
              onChange={(visible) => {
                const updatedGroup = { ...group, visible };
                onChange(updatedGroup);
              }}
            />
            <Icon
              onClick={() => {
                setIsEditing(!isEditing);
              }}
              icon="ellipsis"
            />
          </div>
        )}
        {isEditing && (
          <GroupSettings
            group={group}
            onChange={onChange}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
      {layout === 'list' ? (
        <CharacterList
          characters={group.characters}
          campaignId={campaignId}
          state={state}
          onReorder={(updatedCharacters) =>
            onChange({ ...group, characters: updatedCharacters })
          }
        />
      ) : (
        <CharacterGrid
          characters={group.characters}
          campaignId={campaignId}
          state={state}
          dimensions={group.layout?.dimensions ?? { w: 3, h: 3 }}
          onReorder={(updatedCharacters) =>
            onChange({ ...group, characters: updatedCharacters })
          }
        />
      )}
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)}
      >
        {((group.public && isPlayer) || isAdmin) && (
          <DropdownMenuTrigger asChild>
            <button
              className="absolute right-2 bottom-2 size-12 rounded-full bg-blue-600 font-bold text-white hover:bg-blue-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {isDropdownOpen ? '-' : '+'}
            </button>
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent className="bg-slate-600">
          {sheets.length > 0 ? (
            sheets.map((character) => (
              <DropdownMenuItem
                key={character._id}
                onClick={(e: MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  toggleCharacter(character._id);
                }}
                className="flex cursor-pointer items-center px-2 py-1 hover:bg-slate-700"
              >
                <input
                  type="checkbox"
                  checked={group.characters.some(
                    (groupCharacter) =>
                      groupCharacter.sheet._id === character._id,
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
    </div>
  );
};

const CharacterList: FC<{
  characters: {
    sheet: CharacterSheetT;
    visible: boolean;
    position: { x: number; y: number };
  }[];
  campaignId: string;
  state: 'admin' | 'player' | 'view';
  onReorder: (
    characters: {
      sheet: CharacterSheetT;
      visible: boolean;
      position: { x: number; y: number };
    }[],
  ) => void;
}> = ({ characters, campaignId, state, onReorder }) => {
  const { setBigSheet } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    characterId: string,
  ) => {
    if (!isAdmin) return;
    event.dataTransfer.setData('text/plain', characterId);
    event.dataTransfer.effectAllowed = 'move';
    const card = event.currentTarget.closest(
      '.character-card',
    ) as HTMLElement | null;
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const handleRect = event.currentTarget.getBoundingClientRect();
      const anchorX =
        handleRect.left - cardRect.left + event.nativeEvent.offsetX;
      const anchorY = handleRect.top - cardRect.top + event.nativeEvent.offsetY;
      event.dataTransfer.setDragImage(card, anchorX, anchorY);
    }
    setDraggedId(characterId);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    if (!isAdmin) return;
    event.preventDefault();
    const insertIndex = dropIndex ?? targetIndex;
    const draggedCharacterId =
      draggedId || event.dataTransfer.getData('text/plain');
    if (!draggedCharacterId || insertIndex === null) return;

    const sourceIndex = characters.findIndex(
      (character) => character.sheet._id === draggedCharacterId,
    );
    if (sourceIndex === -1 || sourceIndex === insertIndex) return;

    const updated = [...characters];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(insertIndex, 0, moved);

    // Keep list positions in order so grid mode can reuse them later if needed.
    const normalized = updated.map((character, index) => ({
      ...character,
      position: { x: 0, y: index },
    }));
    console.log('nor', normalized);
    onReorder(normalized);
    setDropIndex(null);
    setDraggedId(null);
  };

  const handleDropContainer = (event: DragEvent<HTMLDivElement>) => {
    if (!isAdmin) return;
    event.preventDefault();
    if (dropIndex === null) return;
    handleDrop(event, dropIndex);
  };

  const handleDragOverRow = (
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (!isAdmin) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const insertBefore = event.clientY - rect.top < rect.height / 2;
    setDropIndex(insertBefore ? index : index + 1);
  };

  const handleDragOverEnd = (event: DragEvent<HTMLDivElement>) => {
    if (!isAdmin) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropIndex(characters.length);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropIndex(null);
  };

  return (
    <div
      className="grid h-full grid-cols-1 content-baseline items-baseline gap-2"
      onDrop={handleDropContainer}
      onDragOver={(event) => {
        if (!isAdmin) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (event.target === event.currentTarget) {
          setDropIndex(characters.length);
        }
      }}
    >
      {characters.map((character, index) => (
        <Fragment key={character.sheet._id}>
          {dropIndex === index && (
            <div className="my-1 h-1 w-full rounded bg-white" />
          )}
          <div
            className="flex items-center gap-2"
            onDragOver={(event) => handleDragOverRow(event, index)}
            onDrop={(event) => handleDrop(event, index)}
          >
            <div className="flex-1">
              <CharacterButton
                character={character.sheet}
                onClick={() => {
                  setBigSheet({
                    sheet: character.sheet,
                    state: isAdmin ? 'toggle' : isPlayer ? 'play' : 'view',
                    campaignId,
                  });
                }}
                campaignId={isAdmin || isPlayer ? undefined : campaignId}
                dragHandle={
                  isAdmin ? (
                    <IconButton
                      icon="drag"
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(event, character.sheet._id)
                      }
                      onDragEnd={handleDragEnd}
                      className="cursor-grab bg-transparent text-gray-400 hover:bg-transparent focus:ring-0 focus:outline-none active:cursor-grabbing"
                    />
                  ) : undefined
                }
              />
            </div>
          </div>
        </Fragment>
      ))}
      <div
        className="relative flex h-6 items-center"
        onDragOver={handleDragOverEnd}
        onDrop={(event) => handleDrop(event, characters.length)}
      >
        {dropIndex === characters.length && (
          <div className="my-1 h-1 w-full rounded bg-white" />
        )}
      </div>
    </div>
  );
};

const CharacterGrid: FC<{
  characters: {
    sheet: CharacterSheetT;
    visible: boolean;
    position: { x: number; y: number };
  }[];
  campaignId: string;
  state: 'admin' | 'player' | 'view';
  dimensions: { w: number; h: number };
  onReorder: (
    characters: {
      sheet: CharacterSheetT;
      visible: boolean;
      position: { x: number; y: number };
    }[],
  ) => void;
}> = ({
  characters,
  campaignId,
  state,
  dimensions = { w: 3, h: 3 },
  onReorder,
}) => {
  const { setBigSheet } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  const grid = Array.from({ length: dimensions.h }, () =>
    Array(dimensions.w).fill(null),
  );
  characters.forEach((character) => {
    if (
      character.position.y < dimensions.h &&
      character.position.x < dimensions.w
    ) {
      grid[character.position.y][character.position.x] = character;
    }
  });

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    characterId: string,
  ) => {
    if (!isAdmin) return;
    event.dataTransfer.setData('text/plain', characterId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    targetX: number,
    targetY: number,
  ) => {
    if (!isAdmin) return;
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    const sourceIndex = characters.findIndex(
      (character) => character.sheet._id === draggedId,
    );
    if (sourceIndex === -1) return;

    const targetIndex = characters.findIndex(
      (character) =>
        character.position.x === targetX && character.position.y === targetY,
    );

    // No change if dropped onto the same spot
    if (targetIndex !== -1 && characters[targetIndex].sheet._id === draggedId) {
      return;
    }

    const sourcePosition = characters[sourceIndex].position;
    const updatedCharacters = characters.map((character, index) => {
      if (index === sourceIndex) {
        return { ...character, position: { x: targetX, y: targetY } };
      }
      if (targetIndex !== -1 && index === targetIndex) {
        return { ...character, position: sourcePosition };
      }
      return character;
    });

    onReorder(updatedCharacters);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!isAdmin) return;
    event.preventDefault();
  };

  return (
    <div className="flex flex-col">
      {grid.map((row, y) => (
        <div key={y} className="flex">
          {row.map((character, x) => (
            <div
              key={x}
              className="flex-1"
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, x, y)}
            >
              {character ? (
                <div
                  draggable={isAdmin}
                  onDragStart={(event) =>
                    handleDragStart(event, character.sheet._id)
                  }
                >
                  <CharacterButton
                    compact
                    character={character.sheet}
                    onClick={() => {
                      setBigSheet({
                        sheet: character.sheet,
                        state: isAdmin ? 'toggle' : isPlayer ? 'play' : 'view',
                        campaignId,
                      });
                    }}
                    campaignId={isAdmin || isPlayer ? undefined : campaignId}
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed bg-gray-600" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Group;
