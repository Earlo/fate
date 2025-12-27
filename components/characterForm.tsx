'use client';
import { userContext } from '@/app/userProvider';
import {
  createCharacterSheet,
  updateCharacterSheet,
} from '@/lib/apiHelpers/sheets';
import { upsertById } from '@/lib/utils';
import { defaultSkills } from '@/schemas/consts/blankCampaignSheet';
import { blankSheet } from '@/schemas/consts/blankCharacterSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { useSession } from 'next-auth/react';
import { FC, FormEvent, useContext, useState } from 'react';
import CharacterSheet from './characterSheet';
import FormContainer from './formContainer';
import Button from './generic/button';
interface CharacterFormProps {
  onClose?: () => void;
  onMinimize?: () => void;
  initialSheet?: CharacterSheetT;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  skills?: string[];
}

const CharacterForm: FC<CharacterFormProps> = ({
  onClose,
  onMinimize,
  initialSheet,
  state = 'create',
  campaignId,
  skills = defaultSkills.map((skill) => skill.name),
}) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<CharacterSheetT>({
    ...blankSheet,
    ...initialSheet,
  });
  const editing = initialSheet && (state === 'edit' || state === 'toggle');
  const creating = state === 'create' && !initialSheet;
  const canSave = editing || creating;
  const { setSheets } = useContext(userContext);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formState,
      ...(creating && { owner: session?.user?.id }),
    };
    try {
      const data = editing
        ? await updateCharacterSheet(initialSheet.id, submitData)
        : await createCharacterSheet(submitData);
      setSheets((prevCharacters) => {
        return upsertById(prevCharacters, data);
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('An error occurred while submitting the form', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    setIsSubmitting(true);
    const deletedId = initialSheet?.id;
    if (!deletedId) {
      return;
    }
    try {
      await fetch(`/api/sheets/${deletedId}`, {
        method: 'DELETE',
      });
      setSheets((prevCharacters) =>
        prevCharacters.filter((char) => char.id !== deletedId),
      );
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('An error occurred while deleting the character', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <FormContainer
      onSubmit={handleSubmit}
      onClose={onClose}
      onMinimize={onMinimize}
    >
      <CharacterSheet
        character={formState}
        setCharacter={canSave ? setFormState : undefined}
        state={state}
        campaignId={campaignId}
        skills={skills}
      />
      {canSave && (
        <Button
          label={editing ? 'Save Changes' : 'Create'}
          type="submit"
          disabled={isSubmitting}
        />
      )}
      {editing && (
        <Button
          label="Delete"
          disabled={isSubmitting}
          type="button"
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-700"
        />
      )}
    </FormContainer>
  );
};

export default CharacterForm;
