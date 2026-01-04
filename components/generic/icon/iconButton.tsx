// components/generic/icon/iconButton.tsx
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';
import Icon, { IconNameT } from './icon';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconNameT;
}

export default function IconButton({
  icon = 'sparkles',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-fit cursor-pointer items-center justify-center rounded-md bg-stone-100 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-stone-100 disabled:hover:text-gray-400 disabled:focus:ring-0',
        className,
      )}
    >
      <Icon icon={icon} />
    </button>
  );
}
