import { HTMLInputTypeAttribute } from 'react';
interface SoloInputProps {
  name: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const SoloInput: React.FC<SoloInputProps> = ({
  name,
  type = 'text',
  value,
  required,
  multiline = false,
  placeholder,
  onChange,
}) =>
  multiline ? (
    <textarea
      name={name}
      value={value}
      placeholder={placeholder}
      className="h-32 p-2 text-base w-full text-gray-700 bg-white border border-gray-300 rounded placeholder-gray-400"
      required={required}
      onChange={onChange}
    />
  ) : (
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      className="h-10 p-2 text-base w-full text-gray-700 bg-white border border-gray-300 rounded placeholder-gray-400"
      required={required}
      onChange={onChange}
    />
  );

export default SoloInput;
