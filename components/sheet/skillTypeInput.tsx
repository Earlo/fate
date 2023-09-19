import ActionToggle from './ActionToggle';
import Label from '../generic/label';
import SoloInput from '../generic/soloInput';
import { cn } from '@/lib/helpers';
type actionOption = 'overcome' | 'advantage' | 'attack' | 'defend';
interface SkillTypeInputProps {
  skills: {
    name: string;
    actions: actionOption[];
  }[];
  setSkills: (
    skills: {
      name: string;
      actions: actionOption[];
    }[],
  ) => void;
  disabled?: boolean;
}

const SkillTypeInput: React.FC<SkillTypeInputProps> = ({
  skills,
  setSkills,
  disabled,
}) => {
  const handleSkillChange = (
    index: number,
    field: string,
    value: string | actionOption[],
  ) => {
    setSkills([
      ...skills.slice(0, index),
      {
        ...skills[index],
        [field]: value,
      },
      ...skills.slice(index + 1),
    ]);
  };

  return (
    <div className="flex flex-col">
      <Label name="Skills">
        {!disabled && (
          <span
            className="duration cursor-pointer pr-4 text-2xl font-bold transition hover:text-gray-400"
            onClick={() => setSkills([...skills, { name: '', actions: [] }])}
          >
            +
          </span>
        )}
      </Label>
      {skills.map((skill, index) => (
        <div key={index} className="flex">
          <SoloInput
            name="name"
            value={skill.name}
            onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
            disabled={disabled}
            className={cn({ 'border-t-0': index !== 0 })}
          />
          <ActionToggle
            actions={skill.actions}
            onChange={(actions) => handleSkillChange(index, 'actions', actions)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
};

export default SkillTypeInput;
