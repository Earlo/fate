import Button from './generic/button';
import CharacterSheet from './characterSheet';
import FormContainer from './formContainer';
import { CharacterSheetT } from '@/schemas/sheet';
import { blankSheet } from '@/consts/blankCharacterSheet';
import { defaultSkills } from '@/consts/blankCampaingSheet';
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
  const isCreateMode = state === 'create';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formState,
      ...(isCreateMode && { controlledBy: session?.user?._id }),
    };
    try {
      const apiMethod = isCreateMode ? 'POST' : 'PUT';
      const apiUrl = isCreateMode
        ? '/api/sheet'
        : `/api/sheet/${initialSheet?._id}`;

      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        console.error('Failed to submit form', await response.json());
        return;
      }
      const data = await response.json();
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
          label={isCreateMode ? 'Create Character' : 'Save Changes'}
          disabled={isSubmitting}
          type="submit"
        />
      )}
    </FormContainer>
  );
};

export default CharacterForm;
