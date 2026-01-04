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
    <div
      className={cn('relative h-full w-full', {
        'blur filter': campaignId
          ? !character.icon?.visibleIn?.includes(campaignId)
          : false,
      })}
      onClick={onClick}
    >
      <Image
        src={character.icon?.url || '/blank_user.png'}
        alt={character.name?.text || 'Character'}
        fill
        sizes="100vw"
        className="rounded-lg object-cover transition-transform duration-200 hover:scale-105 hover:cursor-pointer"
      />
    </div>
  );

export default CharacterButton;
