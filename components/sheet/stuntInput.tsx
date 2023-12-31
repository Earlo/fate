import VisibilityToggle from './visibilityToggle';
import Input from '../generic/input';
import Label from '../generic/label';
import CloseButton from '../generic/closeButton';
import AddButton from '../generic/addButton';
import { cn } from '@/lib/helpers';

interface StuntInputProps {
  stunts: { name: string; description: string; visibleIn: string[] }[];
  setStunts: (
    value: { name: string; description: string; visibleIn: string[] }[],
  ) => void;
  disabled?: boolean;
  campaignId?: string;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  title?: string;
  className?: string;
}

const StuntInput: React.FC<StuntInputProps> = ({
  stunts,
  setStunts,
  disabled = false,
  campaignId,
  state,
  title = 'Stunt',
  className,
}) => {
  const anyWidgets = !(!disabled || (state === 'toggle' && campaignId));
  return (
    <div className={cn('w-full', className)}>
      <Label name={title + 's'}>
        {!disabled && (
          <AddButton
            onClick={() =>
              setStunts([
                ...stunts,
                { name: '', description: '', visibleIn: [] },
              ])
            }
          />
        )}
      </Label>
      {stunts.map((stunt, index) => (
        <div key={index} className="flex grow flex-col pb-2 sm:flex-row">
          <div className="flex h-10 min-w-[50%] flex-row-reverse items-center sm:flex-row sm:pr-2">
            {!disabled && (
              <CloseButton
                className=""
                onClick={() =>
                  setStunts([
                    ...stunts.slice(0, index),
                    ...stunts.slice(index + 1),
                  ])
                }
              />
            )}
            {state === 'toggle' && campaignId && (
              <VisibilityToggle
                visible={stunt?.visibleIn.includes(campaignId)}
                onChange={(visible) =>
                  setStunts([
                    ...stunts.slice(0, index),
                    {
                      name: stunt.name,
                      description: stunt.description,
                      visibleIn: visible
                        ? [...stunt.visibleIn, campaignId]
                        : stunt.visibleIn.filter((id) => id !== campaignId),
                    },
                    ...stunts.slice(index + 1),
                  ])
                }
              />
            )}
            <Input
              name={`${title}-${index}-name`}
              value={
                state === 'toggle'
                  ? stunt?.visibleIn.includes(campaignId || '')
                    ? stunt.name
                    : '???'
                  : stunt.name
              }
              placeholder={`${title} Name`}
              required
              disabled={disabled}
              onChange={(e) =>
                setStunts([
                  ...stunts.slice(0, index),
                  {
                    name: e.target.value,
                    description: stunt.description,
                    visibleIn: stunt.visibleIn,
                  },
                  ...stunts.slice(index + 1),
                ])
              }
              className={cn(
                'grow rounded-b-none border-b-0 sm:rounded-b sm:border-b-2',
                {
                  'rounded-t-none': index === 0 && !anyWidgets,
                },
              )}
            />
          </div>
          <Input
            name={`${title}-${index}-description`}
            value={
              state === 'toggle'
                ? stunt?.visibleIn.includes(campaignId || '')
                  ? stunt.description
                  : '???'
                : stunt.description
            }
            placeholder={
              stunt.name
                ? `Description for ${stunt.name}`
                : `${title} description`
            }
            multiline
            required
            disabled={disabled}
            onChange={(e) =>
              setStunts([
                ...stunts.slice(0, index),
                {
                  name: stunt.name,
                  description: e.target.value,
                  visibleIn: stunt.visibleIn,
                },
                ...stunts.slice(index + 1),
              ])
            }
            className={cn('grow rounded-tl-none sm:rounded-tl', {
              'rounded-tr-none sm:rounded-tr': anyWidgets,
              'sm:rounded-tl-none': index === 0,
            })}
          />
        </div>
      ))}
    </div>
  );
};

export default StuntInput;
