import { CharacterSheetT } from '@/schemas/sheet';
import Image from 'next/image';
interface CharacterButtonProps {
  character: CharacterSheetT;
  onClick?: () => void;
}

const CharacterButton: React.FC<CharacterButtonProps> = ({
  character,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="flex w-48 cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-200  hover:text-gray-800"
  >
    <Image
      src={character.icon?.url || '/drowsee_128.png'}
      alt={character.name.text}
      width={64}
      height={64}
      className="h-16 w-16"
    />
    <div className="ml-4">
      <h3 className="text-lg font-bold">{character.name.text}</h3>
      <p className="text-sm text-gray-600">{character.aspects[0]?.name}</p>
    </div>
  </div>
);

export default CharacterButton;
