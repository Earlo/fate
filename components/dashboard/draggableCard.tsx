import CharacterCard from '@/components/characterCard';
import { useDebouncedRefresh } from '@/hooks/useDebouncedRefresh';
import { getCharacterSheetById } from '@/lib/apiHelpers/sheets';
import { useRealtimeChannel } from '@/lib/realtime/useRealtimeChannel';
import { CharacterSheetT, sheetWithContext } from '@/schemas/sheet';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  id: string;
  sheet: sheetWithContext;
  onClose: () => void;
  onMaximize: () => void;
  onSheetUpdate?: (updated: CharacterSheetT) => void;
}

export default function DraggableCard({
  id,
  sheet,
  onClose,
  onMaximize,
  onSheetUpdate,
}: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const { data: session } = useSession();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const persist = sheet.position ?? { x: 0, y: 0 };
  const sheetId = sheet.sheet?.id;
  const enableRealtime = sheet.state === 'play' || sheet.state === 'view';

  useEffect(() => {
    if (!nodeRef.current) return;
    const node = nodeRef.current;
    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateSize());
      observer.observe(node);
    }
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      if (observer) observer.disconnect();
    };
  }, []);

  const refreshSheet = useCallback(async () => {
    if (!sheetId) return;
    try {
      const updated = await getCharacterSheetById(sheetId);
      if (updated && onSheetUpdate) {
        onSheetUpdate(updated);
      }
    } catch (error) {
      console.error('Could not fetch character sheet:', error);
    }
  }, [sheetId, onSheetUpdate]);

  const handleUpdate = useDebouncedRefresh(() => {
    void refreshSheet();
  }, 200);

  const realtimeEvents = useMemo(
    () => ({ 'sheet-updated': handleUpdate }),
    [handleUpdate],
  );

  useRealtimeChannel({
    enabled: Boolean(sheetId && onSheetUpdate && enableRealtime),
    channel: sheetId ? `sheet:${sheetId}` : '',
    streamUrl: sheetId ? `/api/sheets/${sheetId}/stream` : '',
    events: realtimeEvents,
  });

  const rawX = persist.x + (transform?.x ?? 0);
  const rawY = persist.y + (transform?.y ?? 0);
  const maxX =
    typeof window !== 'undefined'
      ? Math.max(
          0,
          Math.max(document.documentElement.scrollWidth, window.innerWidth) -
            size.width,
        )
      : 0;
  const maxY =
    typeof window !== 'undefined'
      ? Math.max(
          0,
          Math.max(document.documentElement.scrollHeight, window.innerHeight) -
            size.height,
        )
      : 0;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  const clampedX = size.width ? clamp(rawX, 0, maxX) : rawX;
  const clampedY = size.height ? clamp(rawY, 0, maxY) : rawY;

  const style = {
    position: 'absolute' as const,
    transform: CSS.Translate.toString({
      x: clampedX,
      y: clampedY,
      scaleX: 0,
      scaleY: 0,
    }),
    touchAction: 'none',
  };
  const cardState = sheet.state === 'view' ? 'view' : 'play';

  return (
    <div ref={setRefs} style={style} id={`small-sheet-${id}`}>
      <CharacterCard
        character={sheet.sheet as CharacterSheetT}
        state={cardState}
        campaignId={sheet.campaignId}
        onClose={onClose}
        onMaximize={onMaximize}
        dragListeners={{ ...listeners, ...attributes }}
        isOwner={
          Boolean(session?.user?.admin) ||
          sheet.sheet?.owner === session?.user?.id
        }
      />
    </div>
  );
}
