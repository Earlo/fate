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
    onClick={(event) => {
      event.stopPropagation();
      onChange(!visible);
    }}
    className={cn('focus:outline-none', className)}
  >
    {visible ? (
      <EyeIcon
        aria-hidden="true"
        className="size-6 cursor-pointer text-gray-400 duration-200 hover:text-gray-600"
      />
    ) : (
      <EyeSlashIcon
        aria-hidden="true"
        className="size-6 cursor-pointer text-gray-400 duration-200 hover:text-gray-600"
      />
    )}
  </button>
);

export default VisibilityToggle;
