import SoloInput from './soloInput';
import Label from './label';
import React from 'react';

interface StuntInputProps {
  stunts: { name: string; description: string }[];
  setStunts: (value: { name: string; description: string }[]) => void;
}

const StuntInput: React.FC<StuntInputProps> = ({ stunts, setStunts }) => {
  return (
    <div>
      <Label name="Stunts" />
      {stunts.map((stunt, index) => (
        <div key={index} className="flex">
          <SoloInput
            name={`stunt-${index}-name`}
            value={stunt.name}
            placeholder="Stunt Name"
            required
            onChange={(e) =>
              setStunts([
                ...stunts.slice(0, index),
                { name: e.target.value, description: stunt.description },
                ...stunts.slice(index + 1),
              ])
            }
          />
          <SoloInput
            name={`stunt-${index}-description`}
            value={stunt.description}
            placeholder={
              stunt.name ? `Description for ${stunt.name}` : 'Stunt Description'
            }
            multiline
            required
            onChange={(e) =>
              setStunts([
                ...stunts.slice(0, index),
                { name: stunt.name, description: e.target.value },
                ...stunts.slice(index + 1),
              ])
            }
          />
        </div>
      ))}
    </div>
  );
};

export default StuntInput;
