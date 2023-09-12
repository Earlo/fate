import Label from '../generic/label';
import Checkbox from '../generic/checkbox';
import { CharacterSheetT } from '@/schemas/sheet';

interface StressProps {
  stress?: CharacterSheetT['stress'];
  setStress: (value: CharacterSheetT['stress']) => void;
  disabled: boolean;
}
/** 
 * (parameter) stress: {
    physical?: {
        visibleIn: string[];
        boxes: boolean[];
    } | undefined;
    mental?: {
        visibleIn: string[];
        boxes: boolean[];
    } | undefined;
} | undefined

*/
const Stress: React.FC<StressProps> = ({ stress, setStress, disabled }) => {
  const toggleStress = (index: number, type: 'physical' | 'mental') => {
    const updatedStress =
      type === 'physical'
        ? {
            ...stress,
            physical: {
              ...stress?.physical,
              boxes:
                stress?.physical?.boxes.map((val, idx) =>
                  idx === index ? !val : val,
                ) || [],
              visibleIn: stress?.physical?.visibleIn || [],
            },
          }
        : {
            ...stress,
            mental: {
              ...stress?.mental,
              boxes:
                stress?.mental?.boxes.map((val, idx) =>
                  idx === index ? !val : val,
                ) || [],
              visibleIn: stress?.mental?.visibleIn || [],
            },
          };
    setStress(updatedStress);
  };

  return (
    <div className="flex flex-col py-4">
      <Label name="Stress" />
      <div className="flex">
        <span className="flex h-10 w-full flex-shrink-0 items-center whitespace-nowrap text-lg font-black uppercase text-black lg:w-1/5  ">
          Physical:
        </span>
        {stress?.physical?.boxes.map((stressed, index) => (
          <Checkbox
            name={(index + 1).toString()}
            key={index}
            checked={stressed}
            disabled={disabled}
            onChange={() => toggleStress(index, 'physical')}
          />
        ))}
      </div>
      <div className="flex">
        <span className="flex h-10 w-full flex-shrink-0 items-center whitespace-nowrap text-lg font-black uppercase text-black lg:w-1/5  ">
          Mental:
        </span>
        {stress?.mental?.boxes.map((stressed, index) => (
          <Checkbox
            name={(index + 1).toString()}
            key={index}
            checked={stressed}
            disabled={disabled}
            onChange={() => toggleStress(index, 'mental')}
          />
        ))}
      </div>
    </div>
  );
};

export default Stress;
