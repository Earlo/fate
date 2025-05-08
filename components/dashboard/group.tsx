'use client';
import { userContext } from '@/app/userProvider';
import Button from '@/components/generic/button';
import Icon from '@/components/generic/icon/icon';
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
import { useContext, useState } from 'react';
import LabeledInput from '../generic/labeledInput';
import ToggleSwitch from '../generic/toggleSwitch';
import VisibilityToggle from '../sheet/visibilityToggle';
import CharacterButton from './characterButton';

const GroupSettings: React.FC<{
  group: PopulatedGroup;
  onChange: (updatedGroup?: PopulatedGroup) => void;
  setIsEditing: (isEditing: boolean) => void;
}> = ({ group, onChange, setIsEditing }) => {
  const [newName, setNewName] = useState(group.name);
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
          const updatedGroup = {
            ...group,
            layout: {
              ...group.layout,
              mode:
                group.layout?.mode === 'grid'
                  ? 'list'
                  : ('grid' as 'list' | 'grid'),
            },
          };
          onChange(updatedGroup);
        }}
        label="Grid Layout"
      />
      {group.layout?.mode === 'grid' && (
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            type="number"
            name="width"
            value={group.layout.dimensions.w}
            onChange={(e) =>
              onChange({
                ...group,
                layout: {
                  ...group.layout,
                  dimensions: {
                    ...group.layout.dimensions,
                    w: parseInt(e.target.value),
                  },
                },
              })
            }
          />
          <LabeledInput
            type="number"
            name="height"
            value={group.layout.dimensions.h}
            onChange={(e) =>
              onChange({
                ...group,
                layout: {
                  ...group.layout,
                  dimensions: {
                    ...group.layout.dimensions,
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

const Group: React.FC<GroupProps> = ({
  group,
  state,
  onChange,
  campaignId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { sheets } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';

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
        updatedCharacters.push({
          sheet: character,
          visible: true,
          position: { x: 0, y: updatedCharacters.length },
        });
      }
    }
    const updatedGroup = { ...group, characters: updatedCharacters };
    onChange(updatedGroup);
  };
  const layout = group.layout?.mode || 'list';
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
        />
      ) : (
        <CharacterGrid
          characters={group.characters}
          campaignId={campaignId}
          state={state}
          dimensions={group.layout.dimensions}
        />
      )}
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)}
      >
        {((group.public && isPlayer) || isAdmin) && (
          <DropdownMenuTrigger asChild>
            <button
              className="absolute bottom-2 right-2 size-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-bold"
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
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  toggleCharacter(character._id);
                }}
                className="flex items-center px-2 py-1 hover:bg-slate-700 cursor-pointer"
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

const CharacterList: React.FC<{
  characters: { sheet: CharacterSheetT; visible: boolean }[];
  campaignId: string;
  state: 'admin' | 'player' | 'view';
}> = ({ characters, campaignId, state }) => {
  const { setBigSheet } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';
  return (
    <div className="grid grid-cols-1 gap-2">
      {characters.map((character) => (
        <CharacterButton
          key={character.sheet._id}
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
      ))}
    </div>
  );
};

const CharacterGrid: React.FC<{
  characters: {
    sheet: CharacterSheetT;
    visible: boolean;
    position: { x: number; y: number };
  }[];
  campaignId: string;
  state: 'admin' | 'player' | 'view';
  dimensions: { w: number; h: number };
}> = ({ characters, campaignId, state, dimensions = { w: 3, h: 3 } }) => {
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
  //create grid of characters

  return (
    <div className="flex flex-col">
      {grid.map((row, y) => (
        <div key={y} className="flex">
          {row.map((character, x) => (
            <div key={x} className="flex-1">
              {character ? (
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
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed bg-gray-600"></div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Group;
