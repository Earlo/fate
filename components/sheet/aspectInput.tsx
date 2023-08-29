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
    //<div className="w-full pr-4 md:w-1/2 lg:w-4/12">
    <div className="flex flex-col pr-4">
      <div>
        <Label name="Aspects" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, index) =>
          !aspects[index] && disabled ? null : (
            <div key={index} className="mb-2">
              <SoloInput
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
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default AspectInput;
