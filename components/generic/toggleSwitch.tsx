import { cn } from '@/lib/helpers';
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
    <label className={`flex cursor-pointer items-center ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div
          className={cn('block h-8 w-14 rounded-full bg-gray-600', {
            'bg-green-400': checked,
          })}
        />
        <div
          className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${checked ? 'translate-x-full border-gray-600' : 'translate-x-0 border-gray-400'}`}
        />
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
      )}
    </label>
  );
};

export default ToggleSwitch;
