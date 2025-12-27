import { cn } from '@/lib/utils';
interface LabelProps {
  label?: string;
  name: string;
  children?: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ label, name, children, className }) => (
  <label
    className={cn(
      'font-archivo-black relative z-1 flex w-full items-center justify-between bg-neutral-900 px-4 py-1 text-xl leading-tight whitespace-nowrap text-stone-50 uppercase',
      className,
    )}
    style={{
      clipPath:
        'polygon(1rem 0%, 100% 0%, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0% 100%, 0% 1rem)',
    }}
    htmlFor={name}
  >
    {label ? label : name}
    {children}
  </label>
);

export default Label;
