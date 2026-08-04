'use client';
import { ChangeEvent, FC } from 'react';

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
  return (
    <div
      className={`flex items-center justify-center pl-2 ${
        disabled ? 'cursor-not-allowed' : ''
      }`}
    >
      <label
        className={`font-archivo-black relative bottom-2 left-1 z-10 flex grow items-end justify-between text-2xl uppercase ${
          !available ? 'font-outline-2 text-stone-100' : 'text-neutral-950'
        }`}
        htmlFor={id}
      >
        {name}
      </label>
      <div className="relative">
        <input
          type="checkbox"
          id={id || name}
          name={name}
          checked={checked}
          className="hidden"
          onChange={onChange}
          disabled={disabled}
        />
        <label
          htmlFor={id || name}
          className={`block size-8 cursor-pointer rounded border-2 bg-stone-100 ${
            available ? 'border-neutral-950' : 'border-gray-300'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {checked && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-neutral-950">
              X
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default StressBox;
