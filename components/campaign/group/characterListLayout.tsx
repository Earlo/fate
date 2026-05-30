import IconButton from '@/components/generic/icon/iconButton';
import { DragEvent, Fragment, useState } from 'react';
import GroupCharacterCard from './groupCharacterCard';
import { GroupLayoutProps } from './types';

const CharacterListLayout = ({
  characters,
  campaignId,
  state,
  onReorder,
}: GroupLayoutProps) => {
  const isAdmin = state === 'admin';
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    characterId: string,
  ) => {
    if (!isAdmin) return;
    event.dataTransfer.setData('text/plain', characterId);
    event.dataTransfer.effectAllowed = 'move';
    const card = event.currentTarget.closest(
      '.character-card',
    ) as HTMLElement | null;
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const handleRect = event.currentTarget.getBoundingClientRect();
      const anchorX =
        handleRect.left - cardRect.left + event.nativeEvent.offsetX;
      const anchorY = handleRect.top - cardRect.top + event.nativeEvent.offsetY;
      event.dataTransfer.setDragImage(card, anchorX, anchorY);
    }
    setDraggedId(characterId);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    if (!isAdmin) return;
    event.preventDefault();
    const insertIndex = dropIndex ?? targetIndex;
    const draggedCharacterId =
      draggedId || event.dataTransfer.getData('text/plain');
    if (!draggedCharacterId || insertIndex === null) return;

    const sourceIndex = characters.findIndex(
      (character) => character.sheet.id === draggedCharacterId,
    );
    if (sourceIndex === -1 || sourceIndex === insertIndex) return;

    const updated = [...characters];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(insertIndex, 0, moved);
    onReorder(
      updated.map((character, index) => ({
        ...character,
        position: { x: 0, y: index },
      })),
    );
    setDropIndex(null);
    setDraggedId(null);
  };

  return (
    <div
      className="grid h-full grid-cols-1 content-baseline items-baseline gap-2"
      onDrop={(event) => {
        if (dropIndex !== null) handleDrop(event, dropIndex);
      }}
      onDragOver={(event) => {
        if (!isAdmin) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (event.target === event.currentTarget) {
          setDropIndex(characters.length);
        }
      }}
    >
      {characters.map((character, index) => (
        <Fragment key={character.sheet.id}>
          {dropIndex === index && (
            <div className="my-1 h-1 w-full rounded bg-stone-100" />
          )}
          <div
            className="flex items-center gap-2"
            onDragOver={(event) => {
              if (!isAdmin) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              const rect = event.currentTarget.getBoundingClientRect();
              const insertBefore = event.clientY - rect.top < rect.height / 2;
              setDropIndex(insertBefore ? index : index + 1);
            }}
            onDrop={(event) => handleDrop(event, index)}
          >
            <div className="flex-1">
              <GroupCharacterCard
                character={character.sheet}
                campaignId={campaignId}
                state={state}
                dragHandle={
                  isAdmin ? (
                    <IconButton
                      icon="drag"
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(event, character.sheet.id)
                      }
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDropIndex(null);
                      }}
                      className="cursor-grab bg-transparent text-gray-400 hover:bg-transparent focus:ring-0 focus:outline-none active:cursor-grabbing"
                    />
                  ) : undefined
                }
              />
            </div>
          </div>
        </Fragment>
      ))}
      <div
        className="relative flex h-6 items-center"
        onDragOver={(event) => {
          if (!isAdmin) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          setDropIndex(characters.length);
        }}
        onDrop={(event) => handleDrop(event, characters.length)}
      >
        {dropIndex === characters.length && (
          <div className="my-1 h-1 w-full rounded bg-stone-100" />
        )}
      </div>
    </div>
  );
};

export default CharacterListLayout;
