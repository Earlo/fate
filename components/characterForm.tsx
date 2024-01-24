'use client';
import Button from './generic/button';
import CharacterSheet from './characterSheet';
import FormContainer from './formContainer';
import { CharacterSheetT } from '@/schemas/sheet';
import { blankSheet } from '@/schemas/consts/blankCharacterSheet';
import { defaultSkills } from '@/schemas/consts/blankCampaignSheet';
import {
  createCharacterSheet,
  updateCharacterSheet,
} from '@/lib/apiHelpers/sheets';
import { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
interface CharacterFormProps {
  onClose?: () => void;
  initialSheet?: CharacterSheetT;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  setCharacters?: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
  campaignId?: string;
  skills?: string[];
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  onClose,
  initialSheet,
  state = 'create',
  setCharacters,
  campaignId,
  skills = defaultSkills.map((skill) => skill.name),
}) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Partial<CharacterSheetT>>(
    initialSheet || { ...blankSheet },
  );
  const isEditMode = state === 'edit' && initialSheet;
  const isCreateMode = state === 'create' && !initialSheet;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formState,
      ...(isCreateMode && { owner: session?.user?._id }),
    };
    try {
      const data = isEditMode
        ? await updateCharacterSheet(initialSheet?._id, submitData)
        : await createCharacterSheet(submitData);
      if (setCharacters) {
        setCharacters((prevCharacters) => {
          const index = prevCharacters.findIndex(
            (char) => char._id === data._id,
          );
          if (index !== -1) {
            return [
              ...prevCharacters.slice(0, index),
              data,
              ...prevCharacters.slice(index + 1),
            ];
          } else {
            return [...prevCharacters, data];
          }
        });
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('An error occurred while submitting the form', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <FormContainer onSubmit={handleSubmit} onClose={onClose}>
      <CharacterSheet
        character={formState}
        setCharacter={setCharacters ? setFormState : undefined}
        state={state}
        campaignId={campaignId}
        skills={skills}
      />
      {setCharacters && (
        <Button
          label={isEditMode ? 'Save Changes' : 'Create Character'}
          disabled={isSubmitting}
          type="submit"
        />
      )}
    </FormContainer>
  );
};

export default CharacterForm;
