import { cn } from '@/lib/utils';
import Input from '../generic/input';
interface ConsequenceInputProps {
  rank: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  available?: boolean;
  tight?: boolean;
  first?: boolean;
}

const ConsequenceInput: React.FC<ConsequenceInputProps> = ({
  rank,
  name,
  value,
  onChange,
  disabled,
  available = true,
  tight = false,
  first = false,
}) => {
  return (
    <div
      className={cn('flex items-center justify-center pb-2', {
        'cursor-not-allowed': disabled,
        'pb-0': tight,
        hidden: !available && tight,
      })}
    >
      <label
        className={`relative bottom-2 left-1 z-10 flex flex-grow items-end justify-between text-2xl font-black uppercase ${
          !available ? 'font-outline-2 text-white' : 'text-black'
        }`}
        htmlFor={name}
      >
        {rank}
      </label>
      <Input
        placeholder={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || !available}
        className={cn(
          { 'rounded-t-none border-t-0': tight && !first },
          { 'rounded-b-none': tight },
        )}
      />
    </div>
  );
};

export default ConsequenceInput;
