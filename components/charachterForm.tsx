import Button from './generic/button';
import Input from './generic/input';
import ImageUploader from './generic/imageUploader';
import FormContainer from './formContainer';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import CloseButton from './generic/closeButton';
import { Skill } from '@/types/fate';
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
  const [name, setName] = useState(initialSheet?.name || '');
  const [icon, setIcon] = useState<string>(initialSheet?.icon || '');
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
  const isViewMode = state === 'view';
  const isEditMode = state === 'edit';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isViewMode) return;
    setIsSubmitting(true);
    let sheet: Partial<CharacterSheetT> = {
      name,
      icon,
      description,
      aspects,
      skills,
      stunts,
    };

    if (!isEditMode) {
      sheet = {
        ...sheet,
        visibleToPlayers: session?.user.admin ? false : true,
        controlledBy: session?.user.id,
      };
    }
    const apiMethod = isEditMode ? 'PUT' : 'POST';
    const apiUrl = isEditMode
      ? `/api/sheet/${initialSheet?._id}`
      : '/api/sheet';
    const response = await fetch(apiUrl, {
      method: apiMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheet),
    });
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
    if (onClose) onClose();
    setIsSubmitting(false);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <CloseButton
        className="float-right relative bottom-4 left-4 "
        onClick={onClose}
      />
      <div className={`flex items-center `}>
        <ImageUploader setIcon={setIcon} icon={icon} path={'charachter'} />
        <div className={`flex flex-col ml-4 flex-grow`}>
          <Input
            name="name"
            required={!isViewMode}
            disabled={isViewMode}
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <Input
            name="Description"
            multiline
            required={!isViewMode}
            disabled={isViewMode}
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <AspectInput
          aspects={aspects}
          setAspects={setAspects}
          disabled={isViewMode}
        />
        <SkillGrid
          skills={skills}
          setSkills={setSkills}
          disabled={isViewMode}
        />
      </div>
      <StuntInput stunts={stunts} setStunts={setStunts} disabled={isViewMode} />
      {!isViewMode && (
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
