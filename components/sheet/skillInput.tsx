import { Skill } from '@/types/fate';
import { cn } from '@/lib/helpers';
interface SkillInputProps {
  level: number;
  onChange: (value: Skill) => void;
  value: Skill | '';
  disabled?: boolean;
  className?: string;
}

const skillOptions: Skill[] = [
  'Athletics',
  'Burglary',
  'Contacts',
  'Crafts',
  'Deceive',
  'Drive',
  'Empathy',
  'Fight',
  'Investigate',
  'Lore',
  'Notice',
  'Physique',
  'Provoke',
  'Rapport',
  'Resources',
  'Shoot',
  'Stealth',
  'Will',
];

const SkillInput: React.FC<SkillInputProps> = ({
  onChange,
  value,
  disabled = false,
  className,
}) => {
  return (
    <select
      className={cn(
        'h-10 w-full appearance-none rounded border border-gray-300 pl-2 text-base font-normal sm:w-32',
        !value ? 'text-gray-400' : 'text-gray-700',
        disabled && !value ? 'bg-gray-200' : 'bg-white',
        { 'hidden sm:flex': disabled && !value },
        className,
      )}
      value={value}
      onChange={(e) => onChange(e.target.value as Skill)}
      disabled={disabled}
    >
      <option value={''}>{disabled ? '' : 'Select'}</option>
      {skillOptions.map((skill: Skill) => (
        <option key={skill} value={skill}>
          {skill}
        </option>
      ))}
    </select>
  );
};

export default SkillInput;
