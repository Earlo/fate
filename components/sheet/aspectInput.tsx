import { cn, updateVisibilityList } from '@/lib/utils';
import IconButton from '../generic/icon/iconButton';
import Input from '../generic/input';
import EditableList from './editableList';
import VisibilityToggle from './visibilityToggle';

interface AspectInputProps {
  aspects: { name: string; visibleIn: string[] }[];
  setAspects: (aspects: { name: string; visibleIn: string[] }[]) => void;
  disabled?: boolean;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  hints?: string[];
  className?: string;
  title?: string;
  tight?: boolean;
}

const AspectInput: React.FC<AspectInputProps> = ({
  aspects,
  setAspects,
  state,
  disabled,
  campaignId,
  hints = ['High Concept', 'Trouble'],
  className,
  title = 'Aspects',
  tight = false,
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
  const showVisibility = state === 'toggle' && campaignId;
  return (
    <EditableList
      title={title}
      items={aspects}
      disabled={disabled}
      className={cn('flex grow flex-col', className)}
      labelClassName="-mb-0.5"
      onAdd={
        disabled
          ? undefined
          : () => setAspects([...aspects, { name: '', visibleIn: [] }])
      }
      renderItem={(aspect, index) => {
        if (!aspect) return null;
        return (
          <div
            key={index}
            className={cn('flex items-center', {
              'mb-2': !tight,
            })}
          >
            <Input
              name={`aspect-${index}`}
              placeholder={
                index < hints.length ? hints[index] : 'Additional Aspect'
              }
              value={
                state === 'play' && !aspect.visibleIn.includes(campaignId || '')
                  ? '???'
                  : aspect.name
              }
              onChange={(e) =>
                handleAspectChange(index, {
                  name: e.target.value,
                  visibleIn: aspect.visibleIn,
                })
              }
              disabled={disabled}
              className={cn({
                'rounded-tl-none': index === 0,
                'rounded-tr-none': index === 0 && (showVisibility || !disabled),
                'rounded-t-none border-t-0': tight && index !== 0,
                'rounded-b-none': tight && index < aspects.length - 1,
              })}
            />
            {showVisibility && (
              <VisibilityToggle
                visible={aspect.visibleIn.includes(campaignId)}
                onChange={(visible) =>
                  handleAspectChange(index, {
                    name: aspect.name,
                    visibleIn: updateVisibilityList(
                      visible,
                      aspect.visibleIn,
                      campaignId,
                    ),
                  })
                }
              />
            )}
            {!disabled && (
              <IconButton
                icon="close"
                onClick={() =>
                  setAspects(aspects.filter((_, i) => i !== index))
                }
              />
            )}
          </div>
        );
      }}
    />
  );
};

export default AspectInput;
