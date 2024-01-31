import Select from '../generic/select';
interface SkillInputProps {
  onChange: (value: string) => void;
  value: string | '';
  disabled?: boolean;
  className?: string;
  selectedSkills?: string[];
  skillOptions: string[];
  children?: React.ReactNode;
}

const SkillInput: React.FC<SkillInputProps> = ({
  onChange,
  value,
  disabled = false,
  className,
  selectedSkills = [],
  skillOptions,
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
  return (
    <Select
      options={options}
      onChange={(value) => onChange(value)}
      value={value}
      disabled={disabled}
      className={className}
      removeText="Remove Skill"
    >
      {children}
    </Select>
  );
};

export default SkillInput;
