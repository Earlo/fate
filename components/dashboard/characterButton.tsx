import { CharacterSheetT } from '@/schemas/sheet';
import { cn } from '@/lib/helpers';
import Image from 'next/image';
interface CharacterButtonProps {
  character: CharacterSheetT;
  campaignId?: string;
  onClick?: () => void;
}

const CharacterButton: React.FC<CharacterButtonProps> = ({
  character,
  campaignId,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="group flex h-24 min-h-0 w-full cursor-pointer items-center justify-around rounded-lg border border-gray-300 pl-4 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 active:bg-gray-300"
  >
    <Image
      src={character.icon?.url || '/blank_user.png'}
      alt={character.name.text}
      width={64}
      height={64}
      className={cn('flex-shrink-0 rounded-full', {
        'blur filter': campaignId
          ? !character.icon?.visibleIn?.includes(campaignId)
          : false,
      })}
    />
    <div className="flex min-w-0 grow flex-col pl-4">
      <h3 className="line-clamp-2 overflow-hidden text-lg font-semibold leading-6 group-hover:underline">
        {campaignId
          ? character.name.visibleIn.includes(campaignId)
            ? character.name.text
            : '???'
          : character.name.text || 'Unnamed Character'}
      </h3>
      <p className="line-clamp-2 overflow-hidden text-sm leading-4 text-gray-600">
        {campaignId
          ? character.aspects[0].visibleIn.includes(campaignId)
            ? character.aspects[0].name
            : '???'
          : character.aspects[0].name || '-'}
      </p>
    </div>
  </div>
);

export default CharacterButton;
