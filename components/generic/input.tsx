import { cn } from '@/lib/helpers';
import { HTMLInputTypeAttribute } from 'react';
interface InputProps {
  name: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  required?: boolean;
  placeholder?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
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
        'relative top-[-2px] z-0 h-24 min-h-8 w-full rounded border-2 border-black bg-white pl-1 font-archivo text-gray-700 placeholder-gray-400',
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
        'relative top-[-2px] z-0 h-8 w-full rounded border-2 border-black bg-white pl-1 font-archivo text-gray-700 placeholder-gray-400',
        className,
      )}
      required={required}
      onChange={onChange}
      disabled={disabled}
    />
  );

export default Input;
