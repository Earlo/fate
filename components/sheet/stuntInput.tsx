import SoloInput from '../generic/soloInput';
import Label from '../generic/label';
import Button from '../generic/button';

interface StuntInputProps {
  stunts: { name: string; description: string }[];
  setStunts: (value: { name: string; description: string }[]) => void;
  disabled?: boolean;
}

const StuntInput: React.FC<StuntInputProps> = ({
  stunts,
  setStunts,
  disabled = false,
}) => {
  return (
    <div>
      <Label name="Stunts" />
      {stunts.map((stunt, index) => (
        <div key={index} className="flex">
          <SoloInput
            name={`stunt-${index}-name`}
            value={stunt.name}
            placeholder="Stunt Name"
            required
            disabled={disabled}
            onChange={(e) =>
              setStunts([
                ...stunts.slice(0, index),
                { name: e.target.value, description: stunt.description },
                ...stunts.slice(index + 1),
              ])
            }
          />
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
                { name: stunt.name, description: e.target.value },
                ...stunts.slice(index + 1),
              ])
            }
          />
        </div>
      ))}
      {!disabled && (
        <Button
          label="Add Stunt"
          onClick={() => setStunts([...stunts, { name: '', description: '' }])}
        />
      )}
    </div>
  );
};

export default StuntInput;
