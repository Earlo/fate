import { cn } from '@/lib/utils';
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  className = '',
}) => {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3',
        className,
      )}
    >
      <span className="font-archivo-black text-xs tracking-[0.08em] text-neutral-900 uppercase">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className="block h-6 w-10 rounded-full bg-neutral-300 transition-colors peer-checked:bg-neutral-900" />
        <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-stone-100 transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
};

export default ToggleSwitch;
