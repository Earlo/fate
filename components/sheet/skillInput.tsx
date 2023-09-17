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
