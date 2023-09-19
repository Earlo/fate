import { cn } from '@/lib/helpers';

interface AddButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, className = '' }) => (
  <span
    className={cn(
      'duration cursor-pointer pr-4 text-2xl font-bold transition hover:text-gray-400',
      className,
    )}
    onClick={onClick}
  >
    +
  </span>
);

export default AddButton;
