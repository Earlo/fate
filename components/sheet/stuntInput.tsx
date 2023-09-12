import VisibilityToggle from './visibilityToggle';
import SoloInput from '../generic/soloInput';
import Label from '../generic/label';
import CloseButton from '../generic/closeButton';

interface StuntInputProps {
  stunts: { name: string; description: string; visibleIn: string[] }[];
  setStunts: (
    value: { name: string; description: string; visibleIn: string[] }[],
  ) => void;
  disabled?: boolean;
  campaignId?: string;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
}

const StuntInput: React.FC<StuntInputProps> = ({
  stunts,
  setStunts,
  disabled = false,
  campaignId,
  state,
}) => {
  return (
    <div className="pb-4">
      <Label name="Stunts">
        {!disabled && (
          <span
            className="duration cursor-pointer pr-2 text-2xl font-bold transition hover:text-gray-400"
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
        <div key={index} className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-row-reverse items-center gap-2 sm:flex-row">
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
              <div className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
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
              </div>
            )}
            <SoloInput
              name={`stunt-${index}-name`}
              value={
                state === 'toggle'
                  ? stunt?.visibleIn.includes(campaignId || '')
                    ? stunt.name
                    : '???'
                  : stunt.name
              }
              placeholder="Stunt Name"
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
              className="flex-grow"
            />
          </div>
          <SoloInput
            name={`stunt-${index}-description`}
            value={
              state === 'toggle'
                ? stunt?.visibleIn.includes(campaignId || '')
                  ? stunt.description
                  : '???'
                : stunt.description
            }
            placeholder={
              stunt.name ? `Description for ${stunt.name}` : 'Stunt Description'
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
            className="w-full sm:w-1/2"
          />
        </div>
      ))}
    </div>
  );
};

export default StuntInput;
