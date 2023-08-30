import Button from './generic/button';
import CloseButton from './generic/closeButton';
import CharacterSheet from './characterSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
interface CharacterFormProps {
  onClose?: () => void;
  initialSheet?: CharacterSheetT;
  state?: 'create' | 'edit' | 'view';
  setCharacters?: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  onClose,
  initialSheet,
  state = 'create',
  setCharacters,
}) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Partial<CharacterSheetT>>(
    initialSheet || {},
  );
  const isEditMode = state === 'edit';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formState,
      controlledBy: session?.user?._id,
    };

    try {
      const apiMethod = isEditMode ? 'PUT' : 'POST';
      const apiUrl = isEditMode
        ? `/api/sheet/${initialSheet?._id}`
        : '/api/sheet';

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
    <form
      onSubmit={handleSubmit}
      className="absolute left-1/2 top-1/2 mx-auto max-h-screen w-full max-w-full -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded bg-white p-4 shadow-md md:w-auto md:p-8 md:pb-8 md:pt-6 lg:max-w-5xl"
    >
      <CloseButton
        className="relative bottom-4 left-4 float-right "
        onClick={onClose}
      />
      <CharacterSheet character={formState} setCharacter={setFormState} />
      {setCharacters && (
        <Button
          label={isEditMode ? 'Save Changes' : 'Create'}
          disabled={isSubmitting}
          type="submit"
        />
      )}
    </form>
  );
};

export default CharacterForm;
