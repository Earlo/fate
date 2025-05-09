import CharacterCard from '@/components/characterCard';
import { CharacterSheetT, sheetWithContext } from '@/schemas/sheet';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  sheet: sheetWithContext;
  onClose: () => void;
  onMaximize: () => void;
}

export default function DraggableCard({
  id,
  sheet,
  onClose,
  onMaximize,
}: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const persist = sheet.position ?? { x: 0, y: 0 };

  const style = {
    transform: CSS.Translate.toString({
      x: persist.x + (transform?.x ?? 0),
      y: persist.y + (transform?.y ?? 0),
      scaleX: 0,
      scaleY: 0,
    }),
    touchAction: 'none',
  };
  return (
    <div ref={setNodeRef} style={style}>
      <CharacterCard
        character={sheet.sheet as CharacterSheetT}
        state="view"
        campaignId={sheet.campaignId}
        onClose={onClose}
        onMaximize={onMaximize}
        dragListeners={{ ...listeners, ...attributes }}
      />
    </div>
  );
}
