'use client';
import { cn } from '@/lib/utils';
import { ChangeEvent, FC } from 'react';
import Label from './label';
interface CheckboxProps {
  id?: string;
  name: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const Checkbox: FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <div
      className={cn('flex flex-col pb-4', {
        'cursor-not-allowed opacity-80': disabled,
      })}
    >
      <Label label={name} name={id || name} className="w-fit pr-4" />
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
          className={cn(
            'block size-8 cursor-pointer rounded border-2 bg-stone-50',
            checked ? 'border-neutral-900' : 'border-gray-300',
            { 'cursor-not-allowed': disabled },
          )}
        >
          {checked && (
            <div className="absolute top-1/2 left-5 -translate-x-1/2 -translate-y-1/2 transform text-neutral-900">
              ✓
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default Checkbox;
