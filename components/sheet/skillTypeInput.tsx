import Icon from '../generic/icon/icon';
import IconButton from '../generic/icon/iconButton';
import Input from '../generic/input';
import Label from '../generic/label';
import ActionToggle from './actionToggle';

import { cn } from '@/lib/utils';
import { type SkillAction } from '@/schemas/campaign';
interface SkillTypeInputProps {
  skills: {
    name: string;
    actions: SkillAction[];
  }[];
  setSkills: (
    skills: {
      name: string;
      actions: SkillAction[];
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
    value: string | SkillAction[],
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
          <Icon
            icon="plus"
            onClick={() => setSkills([...skills, { name: '', actions: [] }])}
          />
        )}
      </Label>
      {skills.map((skill, index) => (
        <div key={index} className="flex items-center">
          <Input
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
          {!disabled && (
            <IconButton
              icon="close"
              onClick={() => setSkills(skills.filter((_, i) => i !== index))}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SkillTypeInput;
