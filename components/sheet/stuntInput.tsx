import Stunt from './stunt';
import Label from '../generic/label';
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
        <Stunt
          key={index}
          index={index}
          stunt={stunt}
          deleteStunt={() =>
            setStunts([...stunts.slice(0, index), ...stunts.slice(index + 1)])
          }
          setStunt={(stunt) =>
            setStunts([
              ...stunts.slice(0, index),
              stunt,
              ...stunts.slice(index + 1),
            ])
          }
          disabled={disabled}
          campaignId={campaignId}
          state={state}
          title={title}
        />
      ))}
    </div>
  );
};

export default StuntInput;
