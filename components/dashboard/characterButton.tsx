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
  disabled?: boolean;
}

const CharacterButton: React.FC<CharacterButtonProps> = ({
  character,
  campaignId,
  onClick,
  compact = false,
  dragHandle,
  disabled = false,
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
      disabled={disabled}
    />
  ) : (
    <div
      className={cn('relative h-full w-full overflow-hidden rounded-lg', {
        'cursor-not-allowed border-2 border-amber-400/80 bg-amber-50/10':
          disabled,
        'blur filter': campaignId
          ? !character.icon?.visibleIn?.includes(campaignId)
          : false,
      })}
      onClick={disabled ? undefined : onClick}
    >
      <Image
        src={character.icon?.url || '/blank_user.png'}
        alt={character.name?.text || 'Character'}
        fill
        sizes="100vw"
        className={cn(
          'rounded-lg object-cover transition-transform duration-200',
          disabled
            ? 'cursor-not-allowed'
            : 'hover:scale-105 hover:cursor-pointer',
        )}
      />
    </div>
  );

export default CharacterButton;
