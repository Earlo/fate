import SoloInput from '../generic/soloInput';
import Label from '../generic/label';
import CloseButton from '../generic/closeButton';

interface StuntInputProps {
  stunts: { name: string; description: string; visibleIn: string[] }[];
  setStunts: (
    value: { name: string; description: string; visibleIn: string[] }[],
  ) => void;
  disabled?: boolean;
}

const StuntInput: React.FC<StuntInputProps> = ({
  stunts,
  setStunts,
  disabled = false,
}) => {
  return (
    <div>
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
        <div key={index} className="flex flex-col sm:flex-row">
          <div className="flex flex-row-reverse sm:flex-row">
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
            <SoloInput
              name={`stunt-${index}-name`}
              value={stunt.name}
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
            />
          </div>
          <SoloInput
            name={`stunt-${index}-description`}
            value={stunt.description}
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
          />
        </div>
      ))}
    </div>
  );
};

export default StuntInput;
