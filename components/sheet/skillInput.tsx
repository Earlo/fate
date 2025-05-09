import { cn } from '@/lib/utils';
import Select from '../generic/select';
interface SkillInputProps {
  onChange: (value: string) => void;
  value: string | '';
  disabled?: boolean;
  className?: string;
  selectedSkills?: string[];
  skillOptions: string[];
  position?: 'first' | 'middle' | 'last';
  topRow?: boolean;
  lastShown?: boolean;
  children?: React.ReactNode;
}

const SkillInput: React.FC<SkillInputProps> = ({
  onChange,
  value,
  disabled = false,
  className,
  selectedSkills = [],
  skillOptions,
  position = 'middle',
  topRow = false,
  lastShown = false,
  children,
}) => {
  const options = skillOptions
    .sort((a, b) => {
      if (selectedSkills.includes(a) === selectedSkills.includes(b)) {
        return a.localeCompare(b);
      }
      return selectedSkills.includes(a) ? 1 : -1;
    })
    .map((skill) => ({
      value: skill,
      label: skill,
      className: selectedSkills.includes(skill)
        ? 'bg-gray-200 text-gray-400'
        : '',
    }));
  const firstSlot = position === 'first';
  const lastSlot = position === 'last';
  return (
    <Select
      options={options}
      onChange={(value) => onChange(value)}
      value={value}
      disabled={disabled}
      removeText="Remove Skill"
      className={cn(
        'rounded-none border-t-0 sm:border-t-2 sm:border-l-0',
        { 'rounded-b sm:rounded-b-none': lastShown && disabled },
        {
          'rounded-t border-t-2 sm:rounded-tr-none sm:rounded-bl sm:border-l-2':
            firstSlot,
        },
        { 'lg:rounded-tl-none': firstSlot && topRow },
        { 'sm:rounded-tr sm:rounded-br': lastSlot },
        className,
      )}
    >
      {children}
    </Select>
  );
};

export default SkillInput;
