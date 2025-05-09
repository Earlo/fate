import { cn } from '@/lib/utils';
import { ChangeEvent, FC, HTMLInputTypeAttribute } from 'react';
interface InputProps {
  name: string;
  type?: HTMLInputTypeAttribute;
  value?: string | number;
  required?: boolean;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input: FC<InputProps> = ({
  name,
  type = 'text',
  value,
  required,
  placeholder,
  onChange,
  multiline = false,
  disabled = false,
  className = '',
}) =>
  multiline ? (
    <textarea
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      className={cn(
        'font-archivo relative z-0 h-24 min-h-8 w-full rounded border-2 border-black bg-white pl-1 text-gray-700 placeholder-gray-400',
        className,
      )}
      required={required}
      onChange={onChange}
      disabled={disabled}
    />
  ) : (
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      className={cn(
        'font-archivo relative z-0 h-8 w-full rounded border-2 border-black bg-white pl-1 text-gray-700 placeholder-gray-400',
        className,
      )}
      required={required}
      onChange={onChange}
      disabled={disabled}
    />
  );

export default Input;
