'use client';
import { ChangeEvent, FC, useRef } from 'react';

interface StressBoxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  available?: boolean;
}

const StressBox: FC<StressBoxProps> = ({
  id,
  name,
  checked,
  onChange,
  disabled,
  available,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    if (checkboxRef.current && !disabled) {
      checkboxRef.current.click();
    }
  };

  return (
    <div
      className={`flex items-center justify-center pl-2 ${
        disabled ? 'cursor-not-allowed' : ''
      }`}
    >
      <label
        className={`font-archivo-black relative bottom-2 left-1 z-10 flex grow items-end justify-between text-2xl uppercase ${
          !available ? 'font-outline-2 text-white' : 'text-black'
        }`}
        htmlFor={id}
      >
        {name}
      </label>
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
          className={`size-8 cursor-pointer rounded border-2 bg-white ${
            available ? 'border-black' : 'border-gray-300'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {checked && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-black">
              X
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StressBox;
