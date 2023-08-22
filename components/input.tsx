import Label from './label';
import { HTMLInputTypeAttribute } from 'react';
interface InputProps {
  label?: string;
  name: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  required?: boolean;
  multiline?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  value,
  required,
  multiline = false,
  onChange,
}) => (
  <div className="mb-4">
    <Label name={name} />
    {multiline ? (
      <textarea
        name={name}
        value={value}
        className="form-control w-full h-32 p-2 text-base text-gray-700 bg-white border border-gray-300 rounded"
        required={required}
        onChange={onChange}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        className="form-control w-full h-10 p-2 text-base text-gray-700 bg-white border border-gray-300 rounded"
        required={required}
        onChange={onChange}
      />
    )}
  </div>
);

export default Input;
