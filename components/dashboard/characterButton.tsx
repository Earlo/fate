import { cn } from '@/lib/utils';
import { CharacterSheetT } from '@/schemas/sheet';
import Image from 'next/image';
interface CharacterButtonProps {
  character: CharacterSheetT;
  campaignId?: string;
  onClick?: () => void;
  compact?: boolean;
}

const CharacterButton: React.FC<CharacterButtonProps> = ({
  character,
  campaignId,
  onClick,
  compact = false,
}) =>
  !compact ? (
    <div
      onClick={onClick}
      className="group flex h-20 min-h-0 w-full cursor-pointer items-center justify-around rounded-lg border border-gray-300 pl-2 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800 focus:ring-2 focus:ring-gray-400 focus:outline-none active:bg-gray-300"
    >
      <Image
        src={character.icon?.url || '/blank_user.png'}
        alt={character.name?.text || 'Character'}
        width={64}
        height={64}
        className={cn('shrink-0 rounded-full', {
          'blur filter': campaignId
            ? !character.icon?.visibleIn?.includes(campaignId)
            : false,
        })}
      />
      <div className="flex min-w-0 grow flex-col pl-4">
        <h3 className="line-clamp-2 overflow-hidden text-lg leading-6 font-semibold group-hover:underline">
          {campaignId
            ? character.name?.visibleIn?.includes(campaignId)
              ? character.name?.text
              : '???'
            : character.name?.text || 'Unnamed Character'}
        </h3>
        <p className="line-clamp-2 overflow-hidden text-sm leading-4 text-gray-600">
          {campaignId
            ? character.aspects[0]?.visibleIn?.includes(campaignId)
              ? character.aspects[0]?.name
              : '???'
            : character.aspects?.[0]?.name || '-'}
        </p>
      </div>
    </div>
  ) : (
    <Image
      onClick={onClick}
      src={character.icon?.url || '/blank_user.png'}
      alt={character.name?.text || 'Character'}
      width={64}
      height={64}
      className={cn(
        'shrink-0 rounded-full transition-colors duration-200 hover:scale-105 hover:cursor-pointer hover:border-2 hover:border-gray-400 hover:shadow-lg',
        {
          'blur filter': campaignId
            ? !character.icon?.visibleIn?.includes(campaignId)
            : false,
        },
      )}
    />
  );

export default CharacterButton;
