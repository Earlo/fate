import Button from './generic/button';
import FormContainer from './formContainer';
import CloseButton from './generic/closeButton';
import CharachterSheet from './charachterSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
interface CharacterFormProps {
  onClose?: () => void;
  initialSheet?: CharacterSheetT;
  state?: 'create' | 'edit' | 'view';
  setCharachters?: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  onClose,
  initialSheet,
  state = 'create',
  setCharachters,
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
    //Add controlled by and visibility
    const submitData = {
      ...formState,
      controlledBy: session?.user?._id,
      visibleToPlayers: !session?.user.admin,
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

      if (setCharachters) {
        setCharachters((prevCharachters) => {
          const index = prevCharachters.findIndex(
            (char) => char._id === data._id,
          );
          if (index !== -1) {
            return [
              ...prevCharachters.slice(0, index),
              data,
              ...prevCharachters.slice(index + 1),
            ];
          } else {
            return [...prevCharachters, data];
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
    <FormContainer onSubmit={handleSubmit}>
      <CloseButton
        className="float-right relative bottom-4 left-4 "
        onClick={onClose}
      />
      <CharachterSheet charachter={formState} setCharachter={setFormState} />
      {setCharachters && (
        <Button
          label={isEditMode ? 'Save Changes' : 'Create'}
          disabled={isSubmitting}
          type="submit"
        />
      )}
    </FormContainer>
  );
};

export default CharacterForm;
