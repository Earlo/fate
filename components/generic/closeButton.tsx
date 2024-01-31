import { cn } from '@/lib/helpers';

interface CloseButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = '',
}) => (
  <button
    type="button"
    className={cn(
      'inline-flex h-fit items-center justify-center rounded-md bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500',
      className,
    )}
    onClick={onClick}
  >
    <span className="sr-only">Close</span>
    <svg
      className="size-6"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);

export default CloseButton;
