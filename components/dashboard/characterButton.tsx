import { cn } from '@/lib/utils';
import { CharacterSheetT } from '@/schemas/sheet';
import Image from 'next/image';
import { ReactNode } from 'react';
import TileButton from './tileButton';
interface CharacterButtonProps {
  character: CharacterSheetT;
  campaignId?: string;
  onClick?: () => void;
  compact?: boolean;
  dragHandle?: ReactNode;
}

const CharacterButton: React.FC<CharacterButtonProps> = ({
  character,
  campaignId,
  onClick,
  compact = false,
  dragHandle,
}) =>
  !compact ? (
    <TileButton
      title={
        campaignId
          ? character.name?.visibleIn?.includes(campaignId)
            ? character.name?.text || 'Unnamed Character'
            : '???'
          : character.name?.text || 'Unnamed Character'
      }
      subtitle={
        campaignId
          ? character.aspects[0]?.visibleIn?.includes(campaignId)
            ? character.aspects[0]?.name
            : '???'
          : character.aspects?.[0]?.name || '-'
      }
      imageUrl={character.icon?.url || '/blank_user.png'}
      imageClassName={cn('rounded-full', {
        'blur filter': campaignId
          ? !character.icon?.visibleIn?.includes(campaignId)
          : false,
      })}
      onClick={onClick}
      className="character-card pr-10 pl-2"
      rightContent={dragHandle}
    />
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
