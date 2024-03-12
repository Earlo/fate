import { cn } from '@/lib/helpers';
import {
  SparklesIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowUpOnSquareIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/solid';

export type supportedIcons =
  | 'sparkles'
  | 'reduce'
  | 'grow'
  | 'upload'
  | 'ellipsis'
  | 'close'
  | 'plus'
  | 'eye'
  | 'noEye';

interface IconProps {
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  className?: string;
  icon: supportedIcons;
  explanation?: string;
}

const icons = {
  sparkles: SparklesIcon,
  reduce: ArrowsPointingInIcon,
  grow: ArrowsPointingOutIcon,
  upload: ArrowUpOnSquareIcon,
  ellipsis: EllipsisVerticalIcon,
  close: XMarkIcon,
  plus: PlusIcon,
  eye: EyeIcon,
  noEye: EyeSlashIcon,
};

const defaultExplanation = {
  close: 'Close',
};

const Icon: React.FC<IconProps> = ({
  onClick,
  className = '',
  icon = 'sparkles',
  explanation,
}) => {
  const IconComponent = icons[icon];
  const screenReader =
    explanation ||
    (defaultExplanation as Record<supportedIcons, string>)[icon] ||
    '';

  return (
    <>
      {screenReader && <span className="sr-only">{screenReader}</span>}
      <IconComponent
        onClick={onClick}
        aria-hidden="true"
        className={cn(
          'max-h-6 min-h-6 min-w-6 max-w-6',
          {
            'cursor-pointer text-white duration-200 hover:text-gray-400':
              onClick,
          },
          className,
        )}
      />
    </>
  );
};

export default Icon;
