import { cn } from '@/lib/helpers';
interface LabelProps {
  label?: string;
  name: string;
  children?: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ label, name, children, className }) => (
  <label
    className={cn(
      'relative z-[1] flex w-full items-center justify-between whitespace-nowrap bg-black p-1 pl-4 text-xl font-black uppercase text-white',
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
