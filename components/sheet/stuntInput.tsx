import { cn } from '@/lib/utils';
import Icon from '../generic/icon/icon';
import Label from '../generic/label';
import Stunt from './stunt';

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
  tight?: boolean;
}

const StuntInput: React.FC<StuntInputProps> = ({
  stunts,
  setStunts,
  disabled = false,
  campaignId,
  state,
  title = 'Stunt',
  className,
  tight,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <Label name={title + 's'} className="-mb-px">
        {!disabled && (
          <Icon
            icon="plus"
            className="mr-2 self-baseline"
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
          tight={tight}
        />
      ))}
    </div>
  );
};

export default StuntInput;
