import { cn } from '@/lib/helpers';
import React, { useState, FC, useRef, useEffect } from 'react';

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
}

const Select: FC<SelectProps> = ({
  options,
  onChange,
  value,
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

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
  return (
    <button
      type="button"
      className={cn(
        'h-10 w-full flex-grow appearance-none items-center rounded border border-gray-400 pl-2 text-left text-base font-normal sm:flex',
        !value ? 'text-gray-400' : 'text-gray-700',
        disabled && !value ? 'bg-gray-200' : 'bg-white',
        { 'hidden sm:flex': disabled && !value },
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      disabled={disabled}
      ref={ref}
    >
      {value || 'Select'}
      {isOpen && (
        <div className="absolute z-30 flex w-fit flex-col rounded border border-gray-200 bg-white text-gray-700 shadow-lg">
          {value && (
            <div
              className="block w-full px-3 py-1 text-left text-gray-700 hover:bg-gray-100 "
              onClick={() => {
                setIsOpen(false);
                onChange('');
              }}
            >
              {'Remove skill'}
            </div>
          )}
          {options.map((option, index) => (
            <div
              key={option.label + index}
              className={cn(
                'block w-full px-3 py-1 text-left text-gray-700 hover:bg-gray-100',
                option.className,
              )}
              onClick={() => {
                setIsOpen(false);
                onChange(option.value);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </button>
  );
};

export default Select;
