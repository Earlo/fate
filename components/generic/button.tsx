import { cn } from '@/lib/utils';

interface ButtonProps {
  label: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  label,
  type,
  disabled,
  onClick,
  className = '',
  children,
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'focus:shadow-outline rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none',
      className,
    )}
  >
    {label}
    {children}
  </button>
);

export default Button;
