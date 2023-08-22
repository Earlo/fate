import React from 'react';

interface SkillInputProps {
  level: number;
  onChange: (value: string) => void;
  value: string;
}
const skillOptions = [
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

const SkillInput: React.FC<SkillInputProps> = ({ level, onChange, value }) => {
  return (
    <div>
      <select
        className="form-control w-full h-10 p-2 text-base text-gray-700 bg-white border border-gray-300 rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select Skill</option>
        {skillOptions.map((skill) => (
          <option key={skill} value={skill}>
            {skill}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SkillInput;
