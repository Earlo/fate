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
      className={`h-32 w-full rounded border border-gray-300 bg-white p-2 text-base text-gray-700 placeholder-gray-400 ${className}`} // Include className here
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
      className={`h-10 w-full rounded border border-gray-300 bg-white p-2 text-base text-gray-700 placeholder-gray-400 ${className}`}
      required={required}
      onChange={onChange}
      disabled={disabled}
    />
  );

export default SoloInput;
