import { Skill } from '@/types/fate';
import React from 'react';

interface SkillInputProps {
  level: number;
  onChange: (value: Skill) => void;
  value: Skill;
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

const SkillInput: React.FC<SkillInputProps> = ({ onChange, value }) => {
  return (
    <select
      className="form-control h-10 p-2 text-base text-gray-700 bg-white border border-gray-300 rounded"
      value={value}
      onChange={(e) => onChange(e.target.value as Skill)}
    >
      <option value="">Select Skill</option>
      {skillOptions.map((skill: Skill) => (
        <option key={skill} value={skill}>
          {skill}
        </option>
      ))}
    </select>
  );
};

export default SkillInput;
