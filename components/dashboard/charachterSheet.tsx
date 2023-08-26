import { CharacterSheetT } from '@/schemas/sheet';
import CharacterForm from '@/components/charachterForm';

interface CharacterSheetProps {
  character: CharacterSheetT;
  editable: boolean;
  setCharachters?: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
  onClose?: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  editable,
  setCharachters,
  onClose,
}) => {
  return (
    <CharacterForm
      initialSheet={character}
      state={editable ? 'edit' : 'view'}
      setCharachters={setCharachters}
      onClose={onClose}
    />
  );
};

export default CharacterSheet;
