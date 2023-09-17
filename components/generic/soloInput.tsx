import { cn } from '@/lib/helpers';
import { HTMLInputTypeAttribute } from 'react';
interface SoloInputProps {
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

const SoloInput: React.FC<SoloInputProps> = ({
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
        'relative top-[-2px] z-0 h-32 w-full rounded border-2 border-gray-300 bg-white p-2 text-base text-gray-700 placeholder-gray-400',
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
        'relative top-[-2px] z-0 h-10 w-full rounded border-2 border-gray-300 bg-white p-2 text-base text-gray-700 placeholder-gray-400',
        className,
      )}
      required={required}
      onChange={onChange}
      disabled={disabled}
    />
  );

export default SoloInput;
