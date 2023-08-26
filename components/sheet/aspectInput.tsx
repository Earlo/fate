import Label from '../generic/label';
import SoloInput from '../generic/soloInput';

interface AspectInputProps {
  aspects: string[];
  setAspects: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
}

const hints = ['High Concept', 'Trouble'];

const AspectInput: React.FC<AspectInputProps> = ({
  aspects,
  setAspects,
  disabled,
}) => {
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
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default AspectInput;
