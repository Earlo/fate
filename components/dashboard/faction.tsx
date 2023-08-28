import CharacterButton from './characterButton';
import Input from '../generic/input';
import Button from '@/components/generic/button';
import { CampaignT } from '@/schemas/campaign';
import { useState } from 'react';

interface FactionProps {
  faction: {
    name: string;
    public: boolean;
    visible: boolean;
    characters: any[];
  };
  isAdmin: boolean;
  onChange: (updatedFaction: CampaignT['factions'][0]) => void;
}

const Faction: React.FC<FactionProps> = ({ faction, isAdmin, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(faction.name);

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
          key={character._id}
          name={character.name}
          highConcept={character.aspects[0]}
          imageUrl={character.icon}
          onClick={() => console.log(character)}
        />
      ))}
    </div>
  );
};

export default Faction;
