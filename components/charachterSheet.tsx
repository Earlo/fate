import Button from './button';
import Input from './input';
import FormContainer from './formContainer';
import React, { FormEvent, useState } from 'react';

interface CharacterSheetProps {
  onClose: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspects, setAspects] = useState(['']);
  const [skills, setSkills] = useState([{ name: '', level: '' }]);
  const [stunts, setStunts] = useState([{ name: '', description: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const sheet = {
      name,
      description,
      aspects,
      skills: skills.map((skill) => ({
        name: skill.name,
        level: Number(skill.level),
      })),
      stunts,
    };
    await fetch('/api/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheet),
    });
    onClose();
    setIsSubmitting(false);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Input
        label="Name:"
        name="name"
        type="text"
        required
        onChange={(e) => setName(e.target.value)}
      />
      <label>Description:</label>
      <textarea
        name="description"
        onChange={(e) => setDescription(e.target.value)}
      />
      {aspects.map((aspect, index) => (
        <Input
          key={aspect}
          label={`Aspect ${index + 1}:`}
          name={`aspect-${index}`}
          type="text"
          value={aspect}
          onChange={(e) =>
            setAspects([
              ...aspects.slice(0, index),
              e.target.value,
              ...aspects.slice(index + 1),
            ])
          }
        />
      ))}
      <Button label="Add Aspect" onClick={() => setAspects([...aspects, ''])} />
      {/* Skill pyramid/grid - modify as needed */}
      <div className="skills">
        {skills.map((skill, index) => (
          <div key={index}>
            <Input
              label={`Skill ${index + 1} Name:`}
              name={`skill-${index}-name`}
              type="text"
              value={skill.name}
              onChange={(e) =>
                setSkills([
                  ...skills.slice(0, index),
                  { name: e.target.value, level: skill.level },
                  ...skills.slice(index + 1),
                ])
              }
            />
            <Input
              label={`Skill ${index + 1} Level:`}
              name={`skill-${index}-level`}
              type="text"
              value={skill.level}
              onChange={(e) =>
                setSkills([
                  ...skills.slice(0, index),
                  { name: skill.name, level: e.target.value },
                  ...skills.slice(index + 1),
                ])
              }
            />
          </div>
        ))}
        <Button
          label="Add Skill"
          onClick={() => setSkills([...skills, { name: '', level: '' }])}
        />
      </div>
      {stunts.map((stunt, index) => (
        <div key={index}>
          <Input
            label={`Stunt ${index + 1} Name:`}
            name={`stunt-${index}-name`}
            type="text"
            value={stunt.name}
            onChange={(e) =>
              setStunts([
                ...stunts.slice(0, index),
                { name: e.target.value, description: stunt.description },
                ...stunts.slice(index + 1),
              ])
            }
          />
          <Input
            label={`Stunt ${index + 1} Description:`}
            name={`stunt-${index}-description`}
            type="text"
            value={stunt.description}
            onChange={(e) =>
              setStunts([
                ...stunts.slice(0, index),
                { name: stunt.name, description: e.target.value },
                ...stunts.slice(index + 1),
              ])
            }
          />
        </div>
      ))}
      <Button
        label="Add Stunt"
        onClick={() => setStunts([...stunts, { name: '', description: '' }])}
      />
      <Button label="Create" disabled={isSubmitting} type="submit" />
      <Button label="Cancel" disabled={isSubmitting} onClick={onClose} />
    </FormContainer>
  );
};

export default CharacterSheet;
