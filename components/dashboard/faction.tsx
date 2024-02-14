'use client';
import CharacterButton from './characterButton';
import LabeledInput from '../generic/labeledInput';
import Button from '@/components/generic/button';
import { PopulatedFaction } from '@/schemas/campaign';
import { userContext } from '@/app/userProvider';
import { useState, useContext } from 'react';
import { useSession } from 'next-auth/react';

interface FactionProps {
  faction: PopulatedFaction;
  state: 'admin' | 'player' | 'view';
  onChange: (updatedFaction: PopulatedFaction) => void;
  campaignId: string;
}

const Faction: React.FC<FactionProps> = ({
  faction,
  state,
  onChange,
  campaignId,
}) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(faction.name);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { sheets, setBigSheet } = useContext(userContext);
  const isAdmin = state === 'admin';
  const isPlayer = state === 'player';

  const handleSave = () => {
    setIsEditing(false);
    const updatedFaction = { ...faction, name: newName };
    onChange(updatedFaction);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(faction.name);
  };

  const toggleProperty = (property: 'public' | 'visible') => {
    const updatedFaction = { ...faction, [property]: !faction[property] };
    onChange(updatedFaction);
  };

  const toggleCharacter = (characterId: string) => {
    const charIndex = faction.characters.findIndex(
      (c) => c.sheet._id === characterId,
    );
    const updatedCharacters = [...faction.characters];
    if (charIndex > -1) {
      updatedCharacters.splice(charIndex, 1);
    } else {
      const character = sheets.find((c) => c._id === characterId);
      if (character) {
        updatedCharacters.push({ sheet: character, visible: true });
      }
    }
    const updatedFaction = { ...faction, characters: updatedCharacters };
    onChange(updatedFaction);
  };
  return (
    <div className="mx-auto flex w-full flex-col rounded-lg bg-gray-800 p-4 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
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
                  checked={faction.visible}
                  onChange={() => toggleProperty('visible')}
                />
                <span>Visible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={faction.public}
                  onChange={() => toggleProperty('public')}
                />
                <span>Public</span>
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {faction.characters.map((character) => (
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
            campaignId={faction.public ? undefined : campaignId}
          />
        ))}
      </div>
      {((faction.public && isPlayer) || isAdmin) && (
        <Button
          label="Toggle your characters"
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
                    checked={faction.characters.some(
                      (factionCharacter) =>
                        factionCharacter.sheet._id === character._id,
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

export default Faction;
