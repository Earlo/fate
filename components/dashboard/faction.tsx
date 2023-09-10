import CharacterButton from './characterButton';
import Input from '../generic/input';
import CharacterForm from '../characterForm';
import Button from '@/components/generic/button';
import { PopulatedFaction } from '@/schemas/campaign';
import { CharacterSheetT } from '@/schemas/sheet';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface FactionProps {
  faction: PopulatedFaction;
  isAdmin: boolean;
  onChange: (updatedFaction: PopulatedFaction) => void;
}

const Faction: React.FC<FactionProps> = ({ faction, isAdmin, onChange }) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(faction.name);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterSheetT | null>(null);
  // Global state? Or not
  const [allCharacters, setAllCharacters] = useState<CharacterSheetT[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const response = await fetch(`/api/sheets?id=${session.user._id}`);
        console.log(response);
        if (response.status === 200) {
          const data = await response.json();
          setAllCharacters(data);
        }
      }
    };
    fetchData();
  }, [session]);

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
      const character = allCharacters.find((c) => c._id === characterId);
      if (character) {
        updatedCharacters.push({ sheet: character, visible: true });
      }
    }
    const updatedFaction = { ...faction, characters: updatedCharacters };
    onChange(updatedFaction);
  };
  return (
    <div className="mx-auto flex w-full flex-col bg-gray-800 p-4 text-white md:w-1/2">
      <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
        <Input
          type="text"
          name={'name'}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={!isEditing}
        />
        {isAdmin && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button label="Save" onClick={handleSave} />
                <Button label="Cancel" onClick={handleCancel} />
              </>
            ) : (
              <Button label="Edit" onClick={() => setIsEditing(true)} />
            )}
            <label>
              Visible
              <input
                type="checkbox"
                checked={faction.visible}
                onChange={() => toggleProperty('visible')}
              />
            </label>
            <label>
              Public
              <input
                type="checkbox"
                checked={faction.public}
                onChange={() => toggleProperty('public')}
              />
            </label>
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {faction.characters.map((character) => (
          <CharacterButton
            key={character.sheet._id}
            character={character.sheet}
            onClick={() => {
              setSelectedCharacter(character.sheet);
            }}
          />
        ))}
      </div>
      {faction.public && (
        <Button
          label="Add character"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        />
      )}
      {isDropdownOpen && (
        <div className="mb-4 flex flex-col gap-2 rounded bg-gray-700 p-2">
          {allCharacters.map((character) => (
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
          ))}
        </div>
      )}
      {selectedCharacter && (
        <CharacterForm
          initialSheet={selectedCharacter}
          state={isAdmin ? 'toggle' : 'view'}
          setCharacters={isAdmin ? setAllCharacters : undefined}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </div>
  );
};

export default Faction;
