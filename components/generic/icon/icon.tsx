// icon.tsx
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Crown,
  Dices,
  Ellipsis,
  EllipsisVertical,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Plus,
  Sparkles,
  Upload,
  User,
  UserX,
  X,
} from 'lucide-react';
import { forwardRef, MouseEventHandler, SVGAttributes } from 'react';

const iconMap = {
  sparkles: Sparkles,
  reduce: Minimize,
  grow: Maximize,
  upload: Upload,
  ellipsis: EllipsisVertical,
  drag: Ellipsis,
  close: X,
  plus: Plus,
  eye: Eye,
  noEye: EyeOff,
  user: User,
  userX: UserX,
  crown: Crown,
  chevronDown: ChevronDown,
  dice: Dices,
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
          onClick &&
            'cursor-pointer text-stone-100 transition hover:text-gray-400',
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
