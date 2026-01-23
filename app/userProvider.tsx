'use client';
import CharacterForm from '@/components/characterForm';
import DraggableCard from '@/components/dashboard/draggableCard';
import { useDebouncedRefresh } from '@/hooks/useDebouncedRefresh';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { useRealtimeChannel } from '@/lib/realtime/useRealtimeChannel';
import { CharacterSheetT, sheetWithContext } from '@/schemas/sheet';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core/dist/types';
import { useSession } from 'next-auth/react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface UserContextT {
  sheets: CharacterSheetT[];
  setSheets: Dispatch<SetStateAction<CharacterSheetT[]>>;
  bigSheet?: sheetWithContext;
  smallSheets: sheetWithContext[];
  setSmallSheets: Dispatch<SetStateAction<sheetWithContext[]>>;
  setBigSheet: Dispatch<SetStateAction<sheetWithContext | undefined>>;
}
export const userContext = createContext<UserContextT>({
  sheets: [],
  setSheets: () => {},
  bigSheet: undefined,
  setBigSheet: () => {},
  smallSheets: [],
  setSmallSheets: () => {},
});

export default function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [sheets, setSheets] = useState<CharacterSheetT[]>([]);
  const [bigSheet, setBigSheet] = useState<sheetWithContext>();
  const [smallSheets, setSmallSheets] = useState<sheetWithContext[]>([]);
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const data = await getCharacterSheetsByUserId(session.user.id);
        setSheets(data);
      }
    };
    fetchData();
  }, [session, setSheets]);

  const refreshSheets = useCallback(async () => {
    if (!userId) return;
    const data = await getCharacterSheetsByUserId(userId);
    setSheets(data);
  }, [userId]);

  const handleUpdate = useDebouncedRefresh(() => {
    void refreshSheets();
  }, 200);

  const realtimeEvents = useMemo(
    () => ({ 'sheet-list-updated': handleUpdate }),
    [handleUpdate],
  );

  useRealtimeChannel({
    enabled: Boolean(userId),
    clientId: userId,
    channel: userId ? `sheet-list:${userId}` : '',
    streamUrl: userId ? `/api/sheets/stream?userId=${userId}` : '',
    events: realtimeEvents,
  });

  const sheetMap = useMemo(
    () => new Map(sheets.map((sheet) => [sheet.id, sheet] as const)),
    [sheets],
  );

  const handleSmallSheetUpdate = useCallback(
    (updated: CharacterSheetT) => {
      setSmallSheets((prev) =>
        prev.map((entry) =>
          entry.sheet?.id === updated.id ? { ...entry, sheet: updated } : entry,
        ),
      );
    },
    [setSmallSheets],
  );

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const handleDragEnd = ({ delta, active }: DragEndEvent) => {
    const node = document.getElementById(`small-sheet-${active.id}`);
    const rect = node?.getBoundingClientRect();
    const maxX = rect
      ? Math.max(
          0,
          Math.max(document.documentElement.scrollWidth, window.innerWidth) -
            rect.width,
        )
      : 0;
    const maxY = rect
      ? Math.max(
          0,
          Math.max(document.documentElement.scrollHeight, window.innerHeight) -
            rect.height,
        )
      : 0;
    setSmallSheets((prev) =>
      prev.map((s) => {
        if (s.sheet?.id !== active.id) return s;
        const nextX = (s.position?.x ?? 0) + delta.x;
        const nextY = (s.position?.y ?? 0) + delta.y;
        return {
          ...s,
          position: {
            x: clamp(nextX, 0, maxX),
            y: clamp(nextY, 0, maxY),
          },
        };
      }),
    );
  };
  return (
    <userContext.Provider
      value={{
        sheets,
        setSheets,
        bigSheet,
        smallSheets,
        setSmallSheets,
        setBigSheet,
      }}
    >
      <DndContext onDragEnd={handleDragEnd}>
        <div className="absolute top-0 left-0 z-50">
          {bigSheet && (
            <CharacterForm
              initialSheet={bigSheet.sheet}
              onClose={() => setBigSheet(undefined)}
              state={bigSheet.state}
              campaignId={bigSheet.campaignId}
              skills={bigSheet.skills}
              onMinimize={() => {
                if (bigSheet.sheet) {
                  setSmallSheets((prev) => {
                    const filtered = prev.filter(
                      (entry) => entry.sheet?.id !== bigSheet.sheet?.id,
                    );
                    const offset = filtered.length * 24;
                    return [
                      ...filtered,
                      { ...bigSheet, position: { x: offset, y: offset } },
                    ];
                  });
                }
                setBigSheet(undefined);
              }}
            />
          )}
          {smallSheets.map((sheet) => {
            const sheetId = sheet.sheet?.id;
            if (!sheetId) return null;
            const resolvedSheet = sheetMap.get(sheetId) ?? sheet.sheet;
            const resolvedContext = resolvedSheet
              ? { ...sheet, sheet: resolvedSheet }
              : sheet;
            return (
              <DraggableCard
                key={sheetId}
                id={sheetId}
                sheet={resolvedContext}
                onClose={() =>
                  setSmallSheets((prev) =>
                    prev.filter((s) => s.sheet?.id !== sheetId),
                  )
                }
                onMaximize={() => {
                  setBigSheet(resolvedContext);
                  setSmallSheets((prev) =>
                    prev.filter((s) => s.sheet?.id !== sheetId),
                  );
                }}
                onSheetUpdate={handleSmallSheetUpdate}
              />
            );
          })}
        </div>
      </DndContext>
      {children}
    </userContext.Provider>
  );
}
