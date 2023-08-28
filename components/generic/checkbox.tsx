import Label from './label';
import React, { useRef } from 'react';

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, checked, onChange }) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (checkboxRef.current) {
      checkboxRef.current.click();
    }
  };

  return (
    <div className="mb-4 flex items-center">
      <div className="relative">
        <input
          ref={checkboxRef}
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          className="hidden"
          onChange={onChange}
        />
        <div
          onClick={handleClick}
          className={`h-8 w-8 cursor-pointer rounded border-2 bg-white ${
            checked ? 'border-green-500' : 'border-gray-300'
          }`}
        >
          {checked && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-green-500">
              ✓
            </div>
          )}
        </div>
      </div>
      <Label name={name} />
    </div>
  );
};

export default Checkbox;
