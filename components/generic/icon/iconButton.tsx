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
        'inline-flex h-fit cursor-pointer items-center justify-center rounded-md bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset',
        className,
      )}
    >
      <Icon icon={icon} />
    </button>
  );
}
