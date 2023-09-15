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
  children?: React.ReactNode;
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
  children,
}) => (
  <div className={cn(className)}>
    {multiline ? (
      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        className="z-0 h-32 w-full rounded border border-gray-300 bg-white p-2 text-base text-gray-700 placeholder-gray-400"
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
        className="z-0 h-10 w-full rounded border border-gray-300 bg-white p-2 text-base text-gray-700 placeholder-gray-400"
        required={required}
        onChange={onChange}
        disabled={disabled}
      />
    )}
    {children && <div className="absolute right-0 top-0 m-2">{children}</div>}
  </div>
);

export default SoloInput;
