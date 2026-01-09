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
import { getCharacterSheetById } from '@/lib/apiHelpers/sheets';
import { uploadImage } from '@/lib/storage/client';
import { PopulatedGroup } from '@/schemas/campaign';
import { CharacterSheetT } from '@/schemas/sheet';
import { useSession } from 'next-auth/react';
import {
  ChangeEvent,
  DragEvent,
  FC,
  Fragment,
  MouseEvent,
  useContext,
  useRef,
  useState,
} from 'react';
import LabeledInput from '../generic/labeledInput';
import ToggleSwitch from '../generic/toggleSwitch';
import VisibilityToggle from '../sheet/visibilityToggle';
import CharacterButton from './characterButton';

const GroupSettings: FC<{
  group: PopulatedGroup;
  onChange: (updatedGroup?: PopulatedGroup) => void;
  setEditing: (editing: boolean) => void;
}> = ({ group, onChange, setEditing }) => {
  const [newName, setNewName] = useState(group.name);
  const layoutDimensions = group.layout?.dimensions ?? { w: 3, h: 3 };
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const updateLayout = (
    updates: Partial<NonNullable<PopulatedGroup['layout']>>,
  ) => {
    const baseLayout =
      group.layout?.mode === 'grid'
        ? group.layout
        : { mode: 'grid' as const, dimensions: layoutDimensions };
    onChange({ ...group, layout: { ...baseLayout, ...updates } });
  };

  const handleBackgroundFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsBackgroundUploading(true);
    try {
      const url = await uploadImage(file, 'groups');
      updateLayout({ backgroundImage: url });
    } catch (error) {
      console.error('Group background upload failed', error);
    } finally {
      setIsBackgroundUploading(false);
      event.target.value = '';
    }
  };
  const handleSave = () => {
    setEditing(false);
    const updatedGroup = { ...group, name: newName };
    onChange(updatedGroup);
  };

  const handleCancel = () => {
    setEditing(false);
    setNewName(group.name);
  };

  const handleDelete = () => {
    setEditing(false);
    onChange();
  };

  const toggleProperty = (property: 'public' | 'visible') => {
    const updatedGroup = { ...group, [property]: !group[property] };
    onChange(updatedGroup);
  };

  return (
    <Modal
      onClose={() => setEditing(false)}
      className="mx-auto max-w-md rounded-lg bg-stone-100 shadow"
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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleSwitch
          checked={group.visible}
          onChange={() => toggleProperty('visible')}
          label="Visible"
          className="px-1 py-1"
        />
        <ToggleSwitch
          checked={group.public}
          onChange={() => toggleProperty('public')}
          label="Public"
          className="px-1 py-1"
        />
        <ToggleSwitch
          checked={group.layout?.mode === 'grid'}
          onChange={() => {
            const nextMode = group.layout?.mode === 'grid' ? 'list' : 'grid';
            const backgroundImage = group.layout?.backgroundImage;
            const nextLayout =
              nextMode === 'grid'
                ? {
                    mode: 'grid' as const,
                    dimensions: group.layout?.dimensions ?? { w: 3, h: 3 },
                    backgroundImage,
                  }
                : group.layout?.dimensions
                  ? {
                      mode: 'list' as const,
                      dimensions: group.layout.dimensions,
                      backgroundImage,
                    }
                  : undefined;
            onChange({ ...group, layout: nextLayout });
          }}
          label="Grid Layout"
          className="px-1 py-1 sm:col-span-2"
        />
      </div>
      {group.layout?.mode === 'grid' && (
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            type="number"
            name="width"
            value={layoutDimensions.w}
            onChange={(e) =>
              updateLayout({
                dimensions: {
                  ...layoutDimensions,
                  w: parseInt(e.target.value),
                },
              })
            }
          />
          <LabeledInput
            type="number"
            name="height"
            value={layoutDimensions.h}
            onChange={(e) =>
              updateLayout({
                dimensions: {
                  ...layoutDimensions,
                  h: parseInt(e.target.value),
                },
              })
            }
          />
          <div className="col-span-2">
            <LabeledInput
              name="Background Image URL"
              value={group.layout?.backgroundImage ?? ''}
              onChange={(e) =>
                updateLayout({ backgroundImage: e.target.value })
              }
              placeholder="Paste an image URL"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundFileChange}
              ref={backgroundInputRef}
              className="hidden"
              disabled={isBackgroundUploading}
            />
            <div className="mt-2 flex gap-2">
              <Button
                label={isBackgroundUploading ? 'Uploading...' : 'Upload Map'}
                onClick={() => backgroundInputRef.current?.click()}
                disabled={isBackgroundUploading}
              />
              <Button
                label="Clear"
                onClick={() => updateLayout({ backgroundImage: '' })}
                disabled={!group.layout?.backgroundImage}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
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
  const [editing, setEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { sheets } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  const layout = group.layout?.mode || 'list';
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
    if (layout !== 'grid') return group.layout;
    const dimensions = { ...layoutDimensions };
    if (y >= dimensions.h) {
      dimensions.h = y + 1;
    }
    return { ...(group.layout ?? { mode: 'grid' }), dimensions };
  };

  const toggleCharacter = (characterId: string) => {
    const charIndex = group.characters.findIndex(
      (c) => c.sheet.id === characterId,
    );
    const updatedCharacters = [...group.characters];
    if (charIndex > -1) {
      updatedCharacters.splice(charIndex, 1);
    } else {
      const character = sheets.find((c) => c.id === characterId);
      if (character) {
        const nextPosition =
          layout === 'grid'
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
            layout === 'grid'
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
  return (
    <div className="relative mx-auto flex min-h-24 w-full grow flex-col rounded-lg bg-gray-800 p-2 text-stone-100 shadow-lg">
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
                setEditing(!editing);
              }}
              icon="ellipsis"
            />
          </div>
        )}
        {editing && (
          <GroupSettings
            group={group}
            onChange={onChange}
            setEditing={setEditing}
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
          backgroundImage={group.layout?.backgroundImage}
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
              className="absolute right-2 bottom-2 size-12 rounded-full bg-blue-600 font-bold text-stone-100 hover:bg-blue-700"
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
                key={character.id}
                onClick={(e: MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  toggleCharacter(character.id);
                }}
                className="flex cursor-pointer items-center px-2 py-1 hover:bg-slate-700"
              >
                <input
                  type="checkbox"
                  checked={group.characters.some(
                    (groupCharacter) =>
                      groupCharacter.sheet.id === character.id,
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
  const { setBigSheet, bigSheet, smallSheets } = useContext(userContext);
  const { data: session } = useSession();
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const openCharacterSheet = async (sheet: CharacterSheetT) => {
    const isOwner = sheet.owner === session?.user?.id;
    const canSeeAll = isAdmin || isOwner;
    const visibilityCampaignId = isAdmin
      ? campaignId
      : canSeeAll
        ? undefined
        : campaignId;
    const nextState = isAdmin
      ? 'toggle'
      : isOwner
        ? 'edit'
        : isPlayer
          ? 'play'
          : 'view';
    try {
      const updated = await getCharacterSheetById(sheet.id);
      setBigSheet({
        sheet: updated ?? sheet,
        state: nextState,
        campaignId: visibilityCampaignId,
      });
    } catch (error) {
      console.error('Failed to refresh character sheet', error);
      setBigSheet({
        sheet,
        state: nextState,
        campaignId: visibilityCampaignId,
      });
    }
  };

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
      (character) => character.sheet.id === draggedCharacterId,
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
        <Fragment key={character.sheet.id}>
          {dropIndex === index && (
            <div className="my-1 h-1 w-full rounded bg-stone-100" />
          )}
          <div
            className="flex items-center gap-2"
            onDragOver={(event) => handleDragOverRow(event, index)}
            onDrop={(event) => handleDrop(event, index)}
          >
            <div className="flex-1">
              {(() => {
                const isOpen =
                  bigSheet?.sheet?.id === character.sheet.id ||
                  smallSheets.some(
                    (entry) => entry.sheet?.id === character.sheet.id,
                  );
                const canSeeAll =
                  isAdmin || character.sheet.owner === session?.user?.id;
                return (
                  <CharacterButton
                    character={character.sheet}
                    isOwner={character.sheet.owner === session?.user?.id}
                    disabled={isOpen}
                    onClick={
                      isOpen
                        ? undefined
                        : () => void openCharacterSheet(character.sheet)
                    }
                    campaignId={canSeeAll ? undefined : campaignId}
                    dragHandle={
                      isAdmin ? (
                        <IconButton
                          icon="drag"
                          draggable
                          onDragStart={(event) =>
                            handleDragStart(event, character.sheet.id)
                          }
                          onDragEnd={handleDragEnd}
                          className="cursor-grab bg-transparent text-gray-400 hover:bg-transparent focus:ring-0 focus:outline-none active:cursor-grabbing"
                        />
                      ) : undefined
                    }
                  />
                );
              })()}
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
          <div className="my-1 h-1 w-full rounded bg-stone-100" />
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
  backgroundImage?: string;
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
  backgroundImage,
  onReorder,
}) => {
  const { setBigSheet, bigSheet, smallSheets } = useContext(userContext);
  const { data: session } = useSession();
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;
  const maxDimension = Math.max(dimensions.w, dimensions.h);
  const cellRadiusClass =
    maxDimension >= 12
      ? 'rounded-none'
      : maxDimension >= 8
        ? 'rounded-sm'
        : maxDimension >= 6
          ? 'rounded-md'
          : 'rounded-lg';
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

  const openCharacterSheet = async (sheet: CharacterSheetT) => {
    const isOwner = sheet.owner === session?.user?.id;
    const canSeeAll = isAdmin || isOwner;
    const visibilityCampaignId = isAdmin
      ? campaignId
      : canSeeAll
        ? undefined
        : campaignId;
    const nextState = isAdmin
      ? 'toggle'
      : isOwner
        ? 'edit'
        : isPlayer
          ? 'play'
          : 'view';
    try {
      const updated = await getCharacterSheetById(sheet.id);
      setBigSheet({
        sheet: updated ?? sheet,
        state: nextState,
        campaignId: visibilityCampaignId,
      });
    } catch (error) {
      console.error('Failed to refresh character sheet', error);
      setBigSheet({
        sheet,
        state: nextState,
        campaignId: visibilityCampaignId,
      });
    }
  };

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
      (character) => character.sheet.id === draggedId,
    );
    if (sourceIndex === -1) return;

    const targetIndex = characters.findIndex(
      (character) =>
        character.position.x === targetX && character.position.y === targetY,
    );

    // No change if dropped onto the same spot
    if (targetIndex !== -1 && characters[targetIndex].sheet.id === draggedId) {
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

  const cells = grid.flatMap((row, y) =>
    row.map((character, x) => ({ character, x, y })),
  );

  return (
    <div
      className="grid w-full overflow-hidden rounded-md"
      style={{
        ...backgroundStyle,
        gridTemplateColumns: `repeat(${dimensions.w}, minmax(0, 1fr))`,
      }}
    >
      {cells.map(({ character, x, y }) => (
        <div
          key={`${x}-${y}`}
          className="aspect-square"
          onDragOver={handleDragOver}
          onDrop={(event) => handleDrop(event, x, y)}
        >
          {character ? (
            <div
              className="h-full w-full overflow-hidden"
              draggable={isAdmin}
              onDragStart={(event) =>
                handleDragStart(event, character.sheet.id)
              }
            >
              {(() => {
                const isOpen =
                  bigSheet?.sheet?.id === character.sheet.id ||
                  smallSheets.some(
                    (entry) => entry.sheet?.id === character.sheet.id,
                  );
                const canSeeAll =
                  isAdmin || character.sheet.owner === session?.user?.id;
                return (
                  <CharacterButton
                    compact
                    character={character.sheet}
                    isOwner={character.sheet.owner === session?.user?.id}
                    disabled={isOpen}
                    onClick={
                      isOpen
                        ? undefined
                        : () => void openCharacterSheet(character.sheet)
                    }
                    campaignId={canSeeAll ? undefined : campaignId}
                  />
                );
              })()}
            </div>
          ) : (
            <div
              className={`h-full w-full ${cellRadiusClass} border border-dashed border-white/20 sm:border-2 sm:border-white/30 ${
                backgroundImage
                  ? 'bg-gray-600/20 sm:bg-gray-600/40'
                  : 'bg-gray-600/60 sm:bg-gray-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Group;
