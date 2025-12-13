import { cn } from '@/lib/utils';
import { CharacterSheetT } from '@/schemas/sheet';
import Label from '../generic/label';
import StressBox from './stressBox';

interface StressProps {
  stress?: CharacterSheetT['stress'];
  setStress: (value: CharacterSheetT['stress']) => void;
  disabled: boolean;
  tight?: boolean;
}

const Stress: React.FC<StressProps> = ({
  stress,
  setStress,
  disabled,
  tight = false,
}) => {
  const baseStress =
    stress ?? {
      physical: { boxes: [false, false], visibleIn: [] as string[] },
      mental: { boxes: [false, false], visibleIn: [] as string[] },
    };
  const toggleStress = (index: number, type: 'physical' | 'mental') => {
    const boxes = baseStress[type].boxes.length
      ? baseStress[type].boxes
      : [false, false];
    const updatedStress = {
      ...baseStress,
      [type]: {
        ...baseStress[type],
        boxes: boxes.map((val, idx) => (idx === index ? !val : val)),
        visibleIn: baseStress[type].visibleIn || [],
      },
    };
    setStress(updatedStress);
  };

  const renderBoxes = (type: 'physical' | 'mental') => {
    const boxes = baseStress[type].boxes;
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

  const renderStressBar = (type: 'physical' | 'mental') => {
    return (
      <div
        className={cn('flex flex-col pb-0', {
          'sm:flex-row sm:pb-2 md:flex-col md:pb-0 lg:flex-row lg:pb-2': !tight,
        })}
      >
        <span
          className={cn(
            'flex h-8 w-[30%] shrink-0 items-center text-lg font-black whitespace-nowrap text-black uppercase',
            { 'h-6': tight },
          )}
        >
          {type}
        </span>
        <div className="flex grow">{renderBoxes(type)}</div>
      </div>
    );
  };
  return (
    <div className={cn('flex flex-col pb-2', { 'sm:pb-0 md:pr-4': !tight })}>
      <Label name="Stress" className={cn({ 'pb-0': tight })} />
      <div
        className={cn('flex flex-col pt-0', {
          'sm:pt-2 md:pt-0 lg:pt-2': !tight,
        })}
      >
        {renderStressBar('physical')}
        {renderStressBar('mental')}
      </div>
    </div>
  );
};

export default Stress;
