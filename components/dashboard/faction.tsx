import CharacterButton from './characterButton';
import Input from '../generic/input';
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
  // Global state? Or not
  const [allCharacters, setAllCharacters] = useState<CharacterSheetT[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const response = await fetch(`/api/sheets?id=${session.user._id}`);
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
    <div className="flex justify-between items-center bg-gray-800 text-white p-4 w-1/2 mx-auto">
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
      {faction.characters.map((character) => (
        <CharacterButton
          key={character.sheet._id}
          character={character.sheet}
          onClick={() => console.log(character)}
        />
      ))}
      {faction.public && (
        <Button
          label="Add character"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        />
      )}
      {isDropdownOpen && (
        <div className="character-dropdown">
          {allCharacters.map((character) => (
            <div key={character._id}>
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
    </div>
  );
};

export default Faction;
