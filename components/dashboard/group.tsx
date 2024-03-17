'use client';
import CharacterButton from './characterButton';
import LabeledInput from '../generic/labeledInput';
import ToggleSwitch from '../generic/toggleSwitch';
import VisibilityToggle from '../sheet/visibilityToggle';
import Button from '@/components/generic/button';
import { PopulatedGroup } from '@/schemas/campaign';
import { userContext } from '@/app/userProvider';
import Icon from '@/components/generic/icon/icon';
import Modal from '@/components/generic/modal';

import { useState, useContext } from 'react';
import { useSession } from 'next-auth/react';

const GroupSettings: React.FC<{
  group: PopulatedGroup;
  onChange: (updatedGroup: PopulatedGroup) => void;
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

  const toggleProperty = (property: 'public' | 'visible') => {
    const updatedGroup = { ...group, [property]: !group[property] };
    onChange(updatedGroup);
  };

  return (
    <Modal
      onClose={() => setIsEditing(false)}
      className="mx-auto max-w-md rounded-lg bg-white shadow"
    >
      <div className="space-y-4">
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
        <div className="flex justify-end space-x-2">
          <Button label="Cancel" onClick={handleCancel} />
          <Button label="Save" onClick={handleSave} />
        </div>
      </div>
    </Modal>
  );
};

interface GroupProps {
  group: PopulatedGroup;
  state: 'admin' | 'player' | 'view';
  onChange: (updatedGroup: PopulatedGroup) => void;
  campaignId: string;
}

const Group: React.FC<GroupProps> = ({
  group,
  state,
  onChange,
  campaignId,
}) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { sheets, setBigSheet } = useContext(userContext);
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
        updatedCharacters.push({ sheet: character, visible: true });
      }
    }
    const updatedGroup = { ...group, characters: updatedCharacters };
    onChange(updatedGroup);
  };
  const layout = group.layout?.mode || 'list';
  return (
    <div className="relative mx-auto flex min-h-24 w-full flex-col rounded-lg bg-gray-800 p-2 text-white shadow-lg">
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
      <div className="grid grid-cols-1 gap-2">
        {group.characters.map((character) => (
          <CharacterButton
            compact={layout === 'list'}
            key={character.sheet._id}
            character={character.sheet}
            onClick={() => {
              setBigSheet({
                sheet: character.sheet,
                state: isAdmin
                  ? 'toggle'
                  : character.sheet.owner === session?.user._id
                    ? 'play'
                    : 'view',
                campaignId,
              });
            }}
            campaignId={group.public ? undefined : campaignId}
          />
        ))}
      </div>
      {((group.public && isPlayer) || isAdmin) && (
        <Button
          className="absolute bottom-2 right-2 size-12 rounded-full"
          label={isDropdownOpen ? '-' : '+'}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        />
      )}
      {isDropdownOpen && (
        <div className="flex flex-col gap-2 rounded bg-gray-700 p-2">
          {sheets.length > 0
            ? sheets.map((character) => (
                <div key={character._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={group.characters.some(
                      (groupCharacter) =>
                        groupCharacter.sheet._id === character._id,
                    )}
                    onChange={() => toggleCharacter(character._id)}
                  />
                  {character.name.text}
                </div>
              ))
            : "You haven't created any characters yet"}
        </div>
      )}
    </div>
  );
};

export default Group;
