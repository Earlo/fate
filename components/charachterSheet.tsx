import Button from './button';
import Input from './input';
import FormContainer from './formContainer';
import SkillGrid from './skillGrid';
import { Skill } from '@/types/fate';
import React, { FormEvent, useState } from 'react';

interface CharacterSheetProps {
  onClose: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspects, setAspects] = useState(['']);
  const [skills, setSkills] = useState<{ [level: number]: Skill[] }>({});
  const [stunts, setStunts] = useState([{ name: '', description: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkillChange = (level: number, slotIndex: number, name: Skill) => {
    const updatedSkills = { ...skills };
    updatedSkills[level] = updatedSkills[level] || [];
    updatedSkills[level][slotIndex] = name;
    setSkills(updatedSkills);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const sheet = {
      name,
      description,
      aspects,
      skills,
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
      <Input name="name" required onChange={(e) => setName(e.target.value)} />
      <Input
        name="Description"
        multiline
        required
        onChange={(e) => setDescription(e.target.value)}
      />
      {aspects.map((aspect, index) => (
        <Input
          key={aspect}
          label={`Aspect ${index + 1}:`}
          name={`aspect-${index}`}
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
      <SkillGrid skills={skills} onChange={handleSkillChange} />
      {stunts.map((stunt, index) => (
        <div key={index}>
          <Input
            label={`Stunt ${index + 1} Name:`}
            name={`stunt-${index}-name`}
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
