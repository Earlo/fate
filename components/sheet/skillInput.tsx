import Select from '../generic/select';
import { Skill } from '@/types/fate';
interface SkillInputProps {
  level: number;
  onChange: (value: Skill) => void;
  value: Skill | '';
  disabled?: boolean;
  className?: string;
  selectedSkills?: Skill[];
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
  selectedSkills = [],
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
  return (
    <Select
      options={options}
      onChange={(value) => onChange(value as Skill)}
      value={value}
      disabled={disabled}
      className={className}
    />
  );
};

export default SkillInput;

/**

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

 */
