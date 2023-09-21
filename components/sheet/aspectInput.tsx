import VisibilityToggle from './visibilityToggle';
import Label from '../generic/label';
import Input from '../generic/input';
import AddButton from '../generic/addButton';
import CloseButton from '../generic/closeButton';
import { cn } from '@/lib/helpers';
interface AspectInputProps {
  aspects: { name: string; visibleIn: string[] }[];
  setAspects: (aspects: { name: string; visibleIn: string[] }[]) => void;
  disabled?: boolean;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  hints?: string[];
  className?: string;
}

const AspectInput: React.FC<AspectInputProps> = ({
  aspects,
  setAspects,
  state,
  disabled,
  campaignId,
  hints = ['High Concept', 'Trouble'],
  className,
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
    <div className={cn('flex grow flex-col', className)}>
      <Label name="Aspects">
        {!disabled && (
          <AddButton
            onClick={() =>
              setAspects([...aspects, { name: '', visibleIn: [] }])
            }
          />
        )}
      </Label>
      <div className="flex flex-col">
        {aspects.map((aspect, index) =>
          !aspect && disabled ? null : (
            <div key={index} className="mb-2 flex items-center">
              <Input
                name={`aspect-${index}`}
                placeholder={
                  index < hints.length ? hints[index] : 'Additional Aspect'
                }
                value={
                  state === 'view' &&
                  !aspect.visibleIn.includes(campaignId || '')
                    ? '???'
                    : aspect?.name || ''
                }
                onChange={(e) =>
                  handleAspectChange(index, {
                    name: e.target.value,
                    visibleIn: aspect?.visibleIn || [],
                  })
                }
                disabled={disabled}
                className={index === 0 ? 'rounded-tl-none' : ''}
              />
              {state === 'toggle' && campaignId && aspect && (
                <VisibilityToggle
                  visible={aspect.visibleIn.includes(campaignId)}
                  onChange={(visible) =>
                    handleAspectChange(index, {
                      name: aspect.name,
                      visibleIn: visible
                        ? [...(aspect.visibleIn || []), campaignId]
                        : aspect.visibleIn.filter((id) => id !== campaignId),
                    })
                  }
                />
              )}
              {!disabled && (
                <CloseButton
                  onClick={() =>
                    setAspects(aspects.filter((_, i) => i !== index))
                  }
                />
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default AspectInput;
