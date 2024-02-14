import { cn } from '@/lib/helpers';
import SelectOption from '@/components/generic/selectOption';
import { useState, FC, useRef, useEffect, ChangeEvent } from 'react';

interface Option {
  value: string;
  label: string;
  className?: string;
}

interface SelectProps {
  options: Option[];
  onChange: (value: string) => void;
  value: string;
  disabled?: boolean;
  className?: string;
  removeText?: string;
  children?: React.ReactNode;
}

const Select: FC<SelectProps> = ({
  options,
  onChange,
  value,
  disabled,
  className,
  removeText,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [customValue, setCustomValue] = useState<string | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        ref.current &&
        event.target &&
        !ref.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    if (customValue !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, customValue]);
  return (
    <div
      className={cn(
        'flex h-8 min-w-[20%] flex-grow items-center overflow-hidden rounded border-2 border-black bg-white text-left align-middle font-archivo text-gray-700 md:w-[0px]',
        !value ? 'text-gray-400' : 'text-gray-700',
        disabled && !value ? 'bg-gray-200' : 'bg-white',
        { 'z-[2] border-2 border-blue-700': customValue !== null },
        { 'hidden sm:flex': disabled && !value },
        { 'cursor-pointer': !disabled },
        { 'pl-1': !children },
        className,
      )}
      onClick={() => (!disabled ? setIsOpen(!isOpen) : null)}
      ref={ref}
    >
      {children}
      {customValue === null && (value || (!disabled ? 'Select' : ''))}
      {customValue !== null && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Fill your own"
          value={customValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          className="block w-full text-left text-gray-700 focus:outline-none"
          onBlur={() => {
            onChange(customValue);
            setCustomValue(null);
          }}
        />
      )}
      {isOpen && !customValue && (
        <div className="absolute z-30 flex w-fit flex-col rounded border border-gray-200 bg-white text-gray-700 shadow-lg">
          {value && (
            <SelectOption
              onClick={() => {
                setIsOpen(false);
                onChange('');
              }}
              label={removeText || 'Remove'}
            />
          )}
          <SelectOption
            onClick={() => {
              setIsOpen(false);
              setCustomValue('');
            }}
            label="Custom value"
          />
          {options.map((option, index) => (
            <SelectOption
              key={option.label + index}
              className={option.className}
              onClick={() => {
                setIsOpen(false);
                onChange(option.value);
              }}
              label={option.label}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
