import { defaultGroupDimensions } from '@/schemas/consts/blankDefaults';
import { DragEvent } from 'react';
import GroupCharacterCard from './groupCharacterCard';
import { GroupCharacter, GroupLayoutProps } from './types';

type CharacterGridLayoutProps = GroupLayoutProps & {
  dimensions?: { w: number; h: number };
  backgroundImage?: string;
};

const CharacterGridLayout = ({
  characters,
  campaignId,
  state,
  dimensions = defaultGroupDimensions(),
  backgroundImage,
  onReorder,
}: CharacterGridLayoutProps) => {
  const isAdmin = state === 'admin';
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;
  const maxDimension = Math.max(dimensions.w, dimensions.h);
  const cellRadiusClass =
    maxDimension >= 12
      ? 'rounded-none'
      : maxDimension >= 8
        ? 'rounded-sm'
        : maxDimension >= 6
          ? 'rounded-md'
          : 'rounded-lg';
  const grid: Array<Array<GroupCharacter | null>> = Array.from(
    { length: dimensions.h },
    () => Array(dimensions.w).fill(null),
  );
  characters.forEach((character) => {
    if (
      character.position.y < dimensions.h &&
      character.position.x < dimensions.w
    ) {
      grid[character.position.y][character.position.x] = character;
    }
  });

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    targetX: number,
    targetY: number,
  ) => {
    if (!isAdmin) return;
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    const sourceIndex = characters.findIndex(
      (character) => character.sheet.id === draggedId,
    );
    if (sourceIndex === -1) return;
    const targetIndex = characters.findIndex(
      (character) =>
        character.position.x === targetX && character.position.y === targetY,
    );
    if (targetIndex !== -1 && characters[targetIndex].sheet.id === draggedId) {
      return;
    }
    const sourcePosition = characters[sourceIndex].position;
    onReorder(
      characters.map((character, index) => {
        if (index === sourceIndex) {
          return { ...character, position: { x: targetX, y: targetY } };
        }
        if (targetIndex !== -1 && index === targetIndex) {
          return { ...character, position: sourcePosition };
        }
        return character;
      }),
    );
  };

  const cells = grid.flatMap((row, y) =>
    row.map((character, x) => ({ character, x, y })),
  );

  return (
    <div
      className="grid w-full overflow-hidden rounded-md"
      style={{
        ...backgroundStyle,
        gridTemplateColumns: `repeat(${dimensions.w}, minmax(0, 1fr))`,
      }}
    >
      {cells.map(({ character, x, y }) => (
        <div
          key={`${x}-${y}`}
          className="aspect-square"
          onDragOver={(event) => {
            if (isAdmin) event.preventDefault();
          }}
          onDrop={(event) => handleDrop(event, x, y)}
        >
          {character ? (
            <div
              className="h-full w-full overflow-hidden"
              draggable={isAdmin}
              onDragStart={(event) => {
                if (!isAdmin) return;
                event.dataTransfer.setData('text/plain', character.sheet.id);
                event.dataTransfer.effectAllowed = 'move';
              }}
            >
              <GroupCharacterCard
                compact
                character={character.sheet}
                campaignId={campaignId}
                state={state}
              />
            </div>
          ) : (
            <div
              className={`h-full w-full ${cellRadiusClass} border border-dashed border-white/20 sm:border-2 sm:border-white/30 ${
                backgroundImage
                  ? 'bg-gray-600/20 sm:bg-gray-600/40'
                  : 'bg-gray-600/60 sm:bg-gray-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CharacterGridLayout;
