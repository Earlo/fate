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
      'font-archivo-black relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden bg-neutral-900 px-5 text-sm tracking-[0.08em] text-stone-50 uppercase shadow-[3px_3px_0_rgba(23,23,23,0.35)] transition-transform duration-150 ease-out',
      'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-950',
      'active:translate-x-px active:translate-y-px',
      'focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-neutral-950',
      'disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-neutral-500 disabled:shadow-none',
      className,
    )}
    style={{
      clipPath:
        'polygon(0.85rem 0%, 100% 0%, 100% calc(100% - 0.85rem), calc(100% - 0.85rem) 100%, 0% 100%, 0% 0.85rem)',
    }}
  >
    {label}
    {children}
  </button>
);

export default Button;
