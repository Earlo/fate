import { cn } from '@/lib/helpers';

interface OptionProps {
  label: string;
  className?: string;
  onClick: () => void;
}

const Option: React.FC<OptionProps> = ({ label, className, onClick }) => {
  return (
    <div
      className={cn(
        'block w-full px-3 py-1 text-left text-gray-700 hover:bg-gray-100',
        className,
      )}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default Option;
