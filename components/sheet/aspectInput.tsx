import VisibilityToggle from './visibilityToggle';
import Label from '../generic/label';
import SoloInput from '../generic/soloInput';

interface AspectInputProps {
  aspects: { name: string; visibleIn: string[] }[];
  setAspects: (aspects: { name: string; visibleIn: string[] }[]) => void;
  disabled?: boolean;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
}

const hints = ['High Concept', 'Trouble'];

const AspectInput: React.FC<AspectInputProps> = ({
  aspects,
  setAspects,
  state,
  disabled,
  campaignId,
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
    <div className="flex flex-col pr-4">
      <Label name="Aspects" />
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, index) =>
          !aspects[index] && disabled ? null : (
            <div key={index} className="mb-2 flex items-center">
              <SoloInput
                name={`aspect-${index}`}
                placeholder={
                  index < hints.length ? hints[index] : 'Additional Aspect'
                }
                value={
                  state === 'view' &&
                  !aspects[index].visibleIn.includes(campaignId || '')
                    ? '???'
                    : aspects[index]?.name || ''
                }
                onChange={(e) =>
                  handleAspectChange(index, {
                    name: e.target.value,
                    visibleIn: aspects[index]?.visibleIn || [],
                  })
                }
                disabled={disabled}
              />
              {state === 'toggle' && campaignId && aspects[index] && (
                <VisibilityToggle
                  visible={aspects[index].visibleIn.includes(campaignId)}
                  onChange={(visible) =>
                    handleAspectChange(index, {
                      name: aspects[index].name,
                      visibleIn: visible
                        ? [...(aspects[index].visibleIn || []), campaignId]
                        : aspects[index].visibleIn.filter(
                            (id) => id !== campaignId,
                          ),
                    })
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
