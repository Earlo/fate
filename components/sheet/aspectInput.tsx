import Label from '../generic/label';
import SoloInput from '../generic/soloInput';

interface AspectInputProps {
  aspects: { name: string; visibleIn: string[] }[];
  setAspects: React.Dispatch<
    React.SetStateAction<{ name: string; visibleIn: string[] }[]>
  >;
  disabled?: boolean;
}

const hints = ['High Concept', 'Trouble'];

const AspectInput: React.FC<AspectInputProps> = ({
  aspects,
  setAspects,
  disabled,
}) => {
  const handleAspectChange = (
    index: number,
    value: { name: string; visibleIn: string[] },
  ) => {
    setAspects([
      ...aspects.slice(0, index),
      value,
      ...aspects.slice(index + 1),
    ]);
  };

  return (
    <div className="w-3/10">
      <Label name="Aspects" />
      {Array.from({ length: 5 }).map((_, index) =>
        !aspects[index] && disabled ? null : (
          <SoloInput
            key={index}
            name={`aspect-${index}`}
            placeholder={
              index < hints.length ? hints[index] : 'Additional Aspect'
            }
            value={aspects[index]?.name || ''}
            onChange={(e) =>
              handleAspectChange(index, {
                name: e.target.value,
                visibleIn: aspects[index]?.visibleIn || [],
              })
            }
            disabled={disabled}
          />
        ),
      )}
    </div>
  );
};

export default AspectInput;
