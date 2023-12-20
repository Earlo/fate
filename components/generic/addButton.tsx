import { cn } from '@/lib/helpers';
import { PlusIcon } from '@heroicons/react/24/solid';

interface AddButtonProps {
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  className?: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, className = '' }) => (
  <PlusIcon
    className={cn(
      'mr-2 size-6 cursor-pointer text-white duration-200 hover:text-gray-400',
      className,
    )}
    onClick={onClick}
  />
);

export default AddButton;
