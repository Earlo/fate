import Label from './label';
import SoloInput from './soloInput';
import { HTMLInputTypeAttribute } from 'react';
interface InputProps {
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

const Input: React.FC<InputProps> = ({
  name,
  type = 'text',
  value,
  required,
  multiline = false,
  placeholder,
  onChange,
}) => (
  <div className="mb-4">
    <Label name={name} />
    <SoloInput
      name={name}
      type={type}
      value={value}
      required={required}
      multiline={multiline}
      placeholder={placeholder}
      onChange={onChange}
    />
  </div>
);

export default Input;
