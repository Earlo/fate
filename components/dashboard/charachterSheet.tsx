import { CharacterSheetT } from '@/schemas/sheet';
import CharacterForm from '@/components/charachterForm';

interface CharacterSheetProps {
  character: CharacterSheetT;
  editable: boolean;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  editable,
}) => {
  return <CharacterForm initialSheet={character} disabled={!editable} />;
};

export default CharacterSheet;
