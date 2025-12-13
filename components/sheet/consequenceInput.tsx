import { cn } from '@/lib/utils';
import { ChangeEvent, FC } from 'react';
import Input from '../generic/input';
interface ConsequenceInputProps {
  rank: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  available?: boolean;
  tight?: boolean;
  first?: boolean;
}

const ConsequenceInput: FC<ConsequenceInputProps> = ({
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
        className={`relative bottom-2 left-1 z-10 flex grow items-end justify-between text-2xl font-archivo-black uppercase ${
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
