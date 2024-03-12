'use client';
import CharacterButton from './characterButton';
import LabeledInput from '../generic/labeledInput';
import Button from '@/components/generic/button';
import { PopulatedGroup } from '@/schemas/campaign';
import { userContext } from '@/app/userProvider';
//import Icon from '@/components/generic/icon/icon';

import { useState, useContext } from 'react';
import { useSession } from 'next-auth/react';
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
  const [newName, setNewName] = useState(group.name);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { sheets, setBigSheet } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';

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
  return (
    <div className="mx-auto flex w-full flex-col rounded-lg bg-gray-800 p-2 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/***
        <h1 className="text-xl font-bold">{group.name}</h1>
        <Icon
          onClick={() => {
            console.log('clicked');
          }}
          icon="ellipsis"
        />    
         */}
        <LabeledInput
          type="text"
          name={'name'}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={!isEditing}
        />
        {isAdmin && (
          <div className="flex items-center pl-1">
            {isEditing ? (
              <div className="flex flex-col">
                <Button label="Save" onClick={handleSave} />
                <Button label="Cancel" onClick={handleCancel} />
              </div>
            ) : (
              <Button label="Edit" onClick={() => setIsEditing(true)} />
            )}
            <div className="flex flex-col pl-1">
              <label className="flex items-center ">
                <input
                  type="checkbox"
                  checked={group.visible}
                  onChange={() => toggleProperty('visible')}
                />
                <span>Visible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={group.public}
                  onChange={() => toggleProperty('public')}
                />
                <span>Public</span>
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {group.characters.map((character) => (
          <CharacterButton
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
          label="+ Sheet"
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
