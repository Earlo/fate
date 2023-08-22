import Label from './label';
import SoloInput from './soloInput';
import React from 'react';

interface AspectInputProps {
  aspects: string[];
  setAspects: React.Dispatch<React.SetStateAction<string[]>>;
}

const hints = ['High Concept', 'Trouble'];

const AspectInput: React.FC<AspectInputProps> = ({ aspects, setAspects }) => {
  const handleAspectChange = (index: number, value: string) => {
    setAspects([
      ...aspects.slice(0, index),
      value,
      ...aspects.slice(index + 1),
    ]);
  };

  return (
    <div className="w-3/10">
      <Label name="Aspects" />
      {Array.from({ length: 5 }).map((_, index) => (
        <SoloInput
          key={index}
          name={`aspect-${index}`}
          placeholder={
            index < hints.length ? hints[index] : 'Additional Aspect'
          }
          value={aspects[index] || ''}
          onChange={(e) => handleAspectChange(index, e.target.value)}
        />
      ))}
    </div>
  );
};

export default AspectInput;
