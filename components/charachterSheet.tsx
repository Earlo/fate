import Button from './button';
import Input from './input';
import FormContainer from './formContainer';
import AspectInput from './aspectInput';
import StuntInput from './stuntInput';
import SkillGrid from './skillGrid';
import { Skill } from '@/types/fate';
import React, { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';

interface CharacterSheetProps {
  onClose: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ onClose }) => {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspects, setAspects] = useState(['', '', '', '', '']);
  const [skills, setSkills] = useState<{ [level: number]: Skill[] }>({});
  const [stunts, setStunts] = useState([{ name: '', description: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const sheet = {
      name,
      description,
      aspects,
      skills,
      stunts,
      visibleToPlayers: session?.user.admin ? false : true,
      controlledBy: session?.user._id,
    };
    await fetch('/api/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheet),
    });
    onClose();
    setIsSubmitting(false);
  };

  const handleSkillChange = (level: number, slotIndex: number, name: Skill) => {
    const updatedSkills = { ...skills };
    updatedSkills[level] = updatedSkills[level] || [];
    updatedSkills[level][slotIndex] = name;
    console.log(updatedSkills);
    setSkills(updatedSkills);
  };

  const handleAspectChange = (index: number, value: string) => {
    setAspects([
      ...aspects.slice(0, index),
      value,
      ...aspects.slice(index + 1),
    ]);
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
      <div className="flex justify-between">
        <AspectInput aspects={aspects} onChange={handleAspectChange} />
        <SkillGrid skills={skills} onChange={handleSkillChange} />
      </div>
      <StuntInput stunts={stunts} setStunts={setStunts} />
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
