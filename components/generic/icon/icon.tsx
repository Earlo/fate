// icon.tsx
import { cn } from '@/lib/utils';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowUpOnSquareIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { forwardRef, MouseEventHandler, SVGAttributes } from 'react';

const iconMap = {
  sparkles: SparklesIcon,
  reduce: ArrowsPointingInIcon,
  grow: ArrowsPointingOutIcon,
  upload: ArrowUpOnSquareIcon,
  ellipsis: EllipsisVerticalIcon,
  drag: EllipsisHorizontalIcon,
  close: XMarkIcon,
  plus: PlusIcon,
  eye: EyeIcon,
  noEye: EyeSlashIcon,
} as const;

export type IconNameT = keyof typeof iconMap;

interface IconProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'onClick' | 'children'
> {
  icon: IconNameT;
  label?: string;
  onClick?: MouseEventHandler<SVGSVGElement>;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, label, className, onClick, ...rest }, ref) => {
    const Component = iconMap[icon];

    return (
      <Component
        ref={ref}
        {...rest}
        onClick={onClick}
        className={cn(
          'h-6 w-6 shrink-0',
          onClick && 'cursor-pointer text-white transition hover:text-gray-400',
          className,
        )}
        role={label ? 'img' : 'presentation'}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      />
    );
  },
);

Icon.displayName = 'Icon';
export default Icon;
