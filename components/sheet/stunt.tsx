import { cn, updateVisibilityList } from '@/lib/utils';
import IconButton from '../generic/icon/iconButton';
import Input from '../generic/input';
import VisibilityToggle from './visibilityToggle';

interface StuntProps {
  stunt: { name: string; description: string; visibleIn: string[] };
  deleteStunt: () => void;
  setStunt: (value: {
    name: string;
    description: string;
    visibleIn: string[];
  }) => void;
  index: number;
  disabled?: boolean;
  campaignId?: string;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  title?: string;
  tight?: boolean;
}

const Stunt: React.FC<StuntProps> = ({
  stunt,
  deleteStunt,
  setStunt,
  index,
  disabled = false,
  campaignId,
  state,
  title = 'Stunt',
  tight = false,
}) => {
  const showVisibility = state === 'toggle' && campaignId;
  const visible =
    stunt.visibleIn.includes(campaignId || '') ||
    showVisibility ||
    state === 'create' ||
    state === 'edit';
  const shouldHide = state === 'play' || state === 'view';
  const anyWidgets = showVisibility || !disabled;
  return (
    <div
      className={cn('flex grow flex-col pb-2 sm:flex-row', {
        'pb-1 sm:flex-col': tight,
      })}
    >
      <div
        className={cn(
          'flex h-8 min-w-[50%] flex-row-reverse items-center sm:flex-row',
        )}
      >
        {!disabled && <IconButton icon="close" onClick={() => deleteStunt()} />}
        {showVisibility && (
          <VisibilityToggle
            visible={stunt.visibleIn.includes(campaignId)}
            onChange={(visible) =>
              setStunt({
                ...stunt,
                visibleIn: updateVisibilityList(
                  visible,
                  stunt.visibleIn,
                  campaignId,
                ),
              })
            }
          />
        )}
        <Input
          name={`${title}-${index}-name`}
          value={shouldHide && !visible ? '???' : stunt.name}
          placeholder={`${title} Name`}
          required
          disabled={disabled}
          onChange={(e) =>
            setStunt({
              ...stunt,
              name: e.target.value,
            })
          }
          className={cn(
            'grow rounded-b-none border-b-0 sm:rounded-r-none sm:rounded-bl sm:border-r-0 sm:border-b-2',
            {
              'rounded-tl-none sm:rounded-t-none': index === 0,
              'rounded-tr-none': anyWidgets && index === 0,
              'sm:rounded-bl-none sm:border-r-2 sm:border-b-0': tight,
              'sm:rounded-tr': tight,
            },
          )}
        />
      </div>
      <Input
        name={`${title}-${index}-description`}
        value={shouldHide && !visible ? '???' : stunt.description}
        placeholder={
          stunt.name ? `Description for ${stunt.name}` : `${title} description`
        }
        multiline
        required
        disabled={disabled}
        onChange={(e) =>
          setStunt({
            ...stunt,
            description: e.target.value,
          })
        }
        className={cn('grow rounded-tl-none sm:rounded-tr', {
          'rounded-tr-none': !anyWidgets,
          'h-12 sm:rounded-tr-none': tight,
        })}
      />
    </div>
  );
};

export default Stunt;
