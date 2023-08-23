import Button from './generic/button';
import Input from './generic/input';
import FormContainer from './formContainer';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import { Skill } from '@/types/fate';
import { CharacterSheetT } from '@/schemas/sheet';
import React, { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';

interface CharacterFormProps {
  onClose?: () => void;
  initialSheet?: CharacterSheetT;
  disabled?: boolean;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  onClose,
  initialSheet,
  disabled,
}) => {
  const { data: session } = useSession();
  const [name, setName] = useState(initialSheet?.name || '');
  const [description, setDescription] = useState(
    initialSheet?.description || '',
  );
  const [aspects, setAspects] = useState(
    initialSheet?.aspects || ['', '', '', '', ''],
  );
  const [skills, setSkills] = useState<{ [level: number]: Skill[] }>(
    initialSheet?.skills || {},
  );
  const [stunts, setStunts] = useState<{ name: string; description: string }[]>(
    initialSheet?.stunts || [{ name: '', description: '' }],
  );
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
      controlledBy: session?.user.id,
    };
    await fetch('/api/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheet),
    });
    if (onClose) onClose();
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
      <div className="flex justify-between">
        <AspectInput aspects={aspects} setAspects={setAspects} />
        <SkillGrid skills={skills} setSkills={setSkills} />
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

export default CharacterForm;
