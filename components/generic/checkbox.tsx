import Label from './label';
import React, { useRef } from 'react';

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
      className={`flex items-center justify-center pb-4 pl-4 ${
        disabled ? 'cursor-not-allowed opacity-80' : ''
      }`}
    >
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
          className={`h-10 w-10 cursor-pointer rounded border-2 bg-white ${
            checked ? 'border-black' : 'border-gray-300'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {checked && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-black">
              ✓
            </div>
          )}
        </div>
      </div>
      <Label label={name} name={id || name} />
    </div>
  );
};

export default Checkbox;
