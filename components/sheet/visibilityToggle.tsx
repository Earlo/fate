import { cn } from '@/lib/helpers';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface VisibilityToggleProps {
  visible: boolean;
  onChange: (visible: boolean) => void;
  className?: string;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
  visible,
  onChange,
  className,
}) => (
  <button
    type="button"
    onClick={() => onChange(!visible)}
    className={cn('focus:outline-none', className)}
  >
    {visible ? (
      <EyeIcon
        aria-hidden="true"
        className="h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-500"
      />
    ) : (
      <EyeSlashIcon
        aria-hidden="true"
        className="h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-500"
      />
    )}
  </button>
);

export default VisibilityToggle;
