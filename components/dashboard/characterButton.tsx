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
    className="group flex w-full max-w-[200px] cursor-pointer items-center space-x-4 rounded-lg border border-gray-300 p-4 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800"
  >
    <Image
      src={character.icon?.url || '/drowsee_128.png'}
      alt={character.name.text}
      width={64}
      height={64}
      className="flex-shrink-0 rounded-full"
    />
    <div className="flex flex-col">
      <h3 className="max-w-[140px] truncate text-lg font-semibold group-hover:underline">
        {character.name.text}
      </h3>
      <p className="max-w-[140px] truncate text-sm text-gray-600">
        {character.aspects[0]?.name}
      </p>
    </div>
  </div>
);

export default CharacterButton;
