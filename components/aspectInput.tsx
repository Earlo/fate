import Label from './label';
import SoloInput from './soloInput';
import React from 'react';

interface AspectInputProps {
  aspects: string[];
  onChange: (index: number, value: string) => void;
}

const hints = ['High Concept', 'Trouble'];

const AspectInput: React.FC<AspectInputProps> = ({ aspects, onChange }) => {
  return (
    <div>
      <Label name="Aspects" />
      <table>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              <td>
                <SoloInput
                  name={`aspect-${index}`}
                  placeholder={
                    index < hints.length ? hints[index] : 'Additional Aspect'
                  }
                  value={aspects[index] || ''}
                  onChange={(e) => onChange(index, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AspectInput;
