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
    className="group flex min-h-0 w-full cursor-pointer items-center space-x-4 rounded-lg border border-gray-300 pl-4 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 active:bg-gray-300"
  >
    <Image
      src={character.icon?.url || '/drowsee_128.png'}
      alt={character.name.text || 'Character icon'}
      width={64}
      height={64}
      className="flex-shrink-0 rounded-full"
    />
    <div className="flex min-w-0 flex-col">
      <div className="flex h-12 flex-col justify-end">
        <h3 className="line-clamp-2 overflow-hidden text-lg font-semibold leading-6 group-hover:underline">
          {character.name.text || 'Unnamed Character'}
        </h3>
      </div>
      <div className="flex h-12 flex-col">
        <p
          className="overflow-hidden text-sm leading-4 text-gray-600"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {character.aspects[0]?.name || 'No aspects available'}
        </p>
      </div>
    </div>
  </div>
);

export default CharacterButton;
