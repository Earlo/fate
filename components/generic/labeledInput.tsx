import Label from './label';
import Input from './input';
import { cn } from '@/lib/utils';
import { HTMLInputTypeAttribute } from 'react';
interface LabeledInputProps {
  name: string;
  type?: HTMLInputTypeAttribute;
  value?: string | number;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
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
  className,
}) => (
  <div className={cn('pb-2', className)}>
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
