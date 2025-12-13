import { cn } from '@/lib/utils';
import { ChangeEvent, FC, HTMLInputTypeAttribute, ReactNode } from 'react';
import Input from './input';
import Label from './label';
interface LabeledInputProps {
  name: string;
  type?: HTMLInputTypeAttribute;
  value?: string | number;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

const LabeledInput: FC<LabeledInputProps> = ({
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
      className="-top-px rounded-tl-none focus:outline-none"
    />
  </div>
);

export default LabeledInput;
