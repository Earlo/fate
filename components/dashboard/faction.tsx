import Input from '../generic/input';
import Button from '@/components/generic/button';
import { useState } from 'react';

interface FactionProps {
  faction: {
    name: string;
    public: boolean;
    visible: boolean;
    characters: any[];
  };
  isAdmin: boolean;
  updateFactionName: (newName: string) => void;
}

const Faction: React.FC<FactionProps> = ({
  faction,
  isAdmin,
  updateFactionName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(faction.name);

  const handleSave = () => {
    updateFactionName(newName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(faction.name); // Reset the name to the original
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
        </div>
      )}
    </div>
  );
};

export default Faction;
