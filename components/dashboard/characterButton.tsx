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
    className="flex items-center p-4 border rounded-lg hover:bg-gray-200 hover:text-gray-800 cursor-pointer  w-48"
  >
    <Image
      src={character.icon?.url || '/drowsee_128.png'}
      alt={character.name.text}
      width={64}
      height={64}
      className="w-16 h-16"
    />
    <div className="ml-4">
      <h3 className="text-lg font-bold">{character.name.text}</h3>
      <p className="text-sm text-gray-600">{character.aspects[0]?.name}</p>
    </div>
  </div>
);

export default CharacterButton;
