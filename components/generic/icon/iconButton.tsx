import Icon, { supportedIcons } from './icon';
import { cn } from '@/lib/helpers';
interface IconButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: supportedIcons;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  className = '',
  icon = 'sparkles',
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-fit cursor-pointer items-center justify-center rounded-md bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500',
        className,
      )}
      onClick={onClick}
    >
      <Icon icon={icon} />
    </button>
  );
};

export default IconButton;
