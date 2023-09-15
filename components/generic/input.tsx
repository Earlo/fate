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
  disabled?: boolean;
  children?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  name,
  type = 'text',
  value,
  required,
  multiline = false,
  placeholder,
  onChange,
  disabled = false,
  children,
}) => (
  <div className="pb-4">
    <Label name={name}>{children}</Label>
    <SoloInput
      name={name}
      type={type}
      value={value}
      required={required}
      multiline={multiline}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      className="rounded-tl-none"
    />
  </div>
);

export default Input;
