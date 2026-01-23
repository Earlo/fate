import { appendItem, cn, removeAtIndex, replaceAtIndex } from '@/lib/utils';
import EditableList from './editableList';
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
    <EditableList
      title={title + 's'}
      items={stunts}
      disabled={disabled}
      className={cn('w-full', className)}
      labelClassName="-mb-px"
      onAdd={
        disabled
          ? undefined
          : () =>
              setStunts(
                appendItem(stunts, {
                  name: '',
                  description: '',
                  visibleIn: [],
                }),
              )
      }
      renderItem={(stunt, index) => (
        <Stunt
          key={index}
          index={index}
          stunt={stunt}
          deleteStunt={() => setStunts(removeAtIndex(stunts, index))}
          setStunt={(stunt) => setStunts(replaceAtIndex(stunts, index, stunt))}
          disabled={disabled}
          campaignId={campaignId}
          state={state}
          title={title}
          tight={tight}
        />
      )}
    />
  );
};

export default StuntInput;
