import Label from './label';
import Input from './input';
import { HTMLInputTypeAttribute } from 'react';
interface LabeledInputProps {
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

const LabeledInput: React.FC<LabeledInputProps> = ({
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
  <div className="pb-2">
    <Label name={name}>{children}</Label>
    <Input
      name={name}
      type={type}
      value={value}
      required={required}
      multiline={multiline}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      className="rounded-tl-none focus:outline-none"
    />
  </div>
);

export default LabeledInput;
