import StressBox from './stressBox';
import Label from '../generic/label';
import { CharacterSheetT } from '@/schemas/sheet';

interface StressProps {
  stress?: CharacterSheetT['stress'];
  setStress: (value: CharacterSheetT['stress']) => void;
  disabled: boolean;
}

const Stress: React.FC<StressProps> = ({ stress, setStress, disabled }) => {
  const toggleStress = (index: number, type: 'physical' | 'mental') => {
    const boxes = stress?.[type]?.boxes || [false, false];
    const updatedStress =
      type === 'physical'
        ? {
            ...stress,
            physical: {
              ...(stress?.physical || [false, false]),
              boxes: boxes.map((val, idx) => (idx === index ? !val : val)),
              visibleIn: stress?.physical?.visibleIn || [],
            },
          }
        : {
            ...stress,
            mental: {
              ...(stress?.mental || [false, false]),
              boxes: boxes.map((val, idx) => (idx === index ? !val : val)),
              visibleIn: stress?.mental?.visibleIn || [],
            },
          };
    setStress(updatedStress);
  };

  const renderBoxes = (type: 'physical' | 'mental') => {
    const boxes = stress?.[type]?.boxes;
    return [0, 1, 2, 3].map((index) => (
      <StressBox
        name={(index + 1).toString()}
        id={type + (index + 1).toString()}
        key={type + (index + 1).toString()}
        checked={boxes?.at(index) || false}
        disabled={disabled || (index > 1 && boxes?.at(index) === undefined)}
        available={boxes?.at(index) !== undefined}
        onChange={() => toggleStress(index, type)}
      />
    ));
  };

  return (
    <div className="flex flex-col pb-2 sm:pb-0 md:pr-4">
      <Label name="Stress" />
      <div className="flex flex-col pt-0 sm:pt-2 md:pt-0 lg:pt-2 ">
        <div className="flex flex-col pb-0 sm:flex-row sm:pb-2 md:flex-col md:pb-0 lg:flex-row lg:pb-2">
          <span className="flex h-8 w-1/5 flex-shrink-0 items-center whitespace-nowrap text-lg font-black uppercase text-black sm:h-8 md:h-8 lg:h-8">
            Physical
          </span>
          <div className="flex flex-grow overflow-x-hidden sm:flex-row">
            {renderBoxes('physical')}
          </div>
        </div>
        <div className="flex flex-col pb-0 sm:flex-row sm:pb-2 md:flex-col md:pb-0 lg:flex-row lg:pb-2">
          <span className="flex h-8 w-1/5 flex-shrink-0 items-center whitespace-nowrap text-lg font-black uppercase text-black sm:h-8 md:h-8 lg:h-8">
            Mental
          </span>
          <div className="flex flex-grow overflow-x-hidden sm:flex-row">
            {renderBoxes('mental')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stress;
