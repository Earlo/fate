import VisibilityToggle from './visibilityToggle';
import SoloInput from '../generic/soloInput';
import Label from '../generic/label';
import CloseButton from '../generic/closeButton';
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
  return (
    <div className={cn('w-full', className)}>
      <Label name={title + 's'}>
        {!disabled && (
          <span
            className="duration cursor-pointer pr-4 text-2xl font-bold transition hover:text-gray-400"
            onClick={() =>
              setStunts([
                ...stunts,
                { name: '', description: '', visibleIn: [] },
              ])
            }
          >
            +
          </span>
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
            <SoloInput
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
              className={index === 0 ? 'grow rounded-t-none' : 'grow'}
            />
          </div>
          <SoloInput
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
            className={index === 0 ? 'grow sm:rounded-tl-none' : 'grow'}
          />
        </div>
      ))}
    </div>
  );
};

export default StuntInput;
