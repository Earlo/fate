'use client';
import Label from './label';
import { cn } from '@/lib/helpers';
import { useRef } from 'react';
interface CheckboxProps {
  id?: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  disabled,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (checkboxRef.current && !disabled) {
      checkboxRef.current.click();
    }
  };

  return (
    <div
      className={cn('flex flex-col pb-4', {
        'cursor-not-allowed opacity-80': disabled,
      })}
    >
      <Label label={name} name={id || name} className="w-fit pr-4" />
      <div className="relative">
        <input
          ref={checkboxRef}
          type="checkbox"
          id={id || name}
          name={name}
          checked={checked}
          className="hidden"
          onChange={onChange}
          disabled={disabled}
        />
        <div
          onClick={handleClick}
          className={cn(
            'size-8 cursor-pointer rounded border-2 bg-white',
            checked ? 'border-black' : 'border-gray-300',
            { 'cursor-not-allowed': disabled },
          )}
        >
          {checked && (
            <div className="absolute left-5 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-black">
              ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkbox;
