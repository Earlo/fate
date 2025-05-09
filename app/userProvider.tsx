'use client';
import CharacterForm from '@/components/characterForm';
import DraggableCard from '@/components/dashboard/draggableCard';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { CharacterSheetT, sheetWithContext } from '@/schemas/sheet';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useSession } from 'next-auth/react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
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

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const data = await getCharacterSheetsByUserId(session.user._id);
        setSheets(data);
      }
    };
    fetchData();
  }, [session, setSheets]);

  const handleDragEnd = ({ delta, active }: DragEndEvent) => {
    setSmallSheets((prev) =>
      prev.map((s) =>
        s.sheet?._id === active.id
          ? {
              ...s,
              position: {
                x: (s.position?.x ?? 0) + delta.x,
                y: (s.position?.y ?? 0) + delta.y,
              },
            }
          : s,
      ),
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
                  setSmallSheets((prev) => [
                    ...prev,
                    { ...bigSheet, position: { x: 0, y: 0 } },
                  ]);
                }
                setBigSheet(undefined);
              }}
            />
          )}
          {smallSheets.map((sheet) => (
            <DraggableCard
              key={sheet.sheet?._id}
              id={sheet.sheet?._id!}
              sheet={sheet}
              onClose={() =>
                setSmallSheets((prev) =>
                  prev.filter((s) => s.sheet?._id !== sheet?.sheet?._id),
                )
              }
              onMaximize={() => {
                setBigSheet(sheet);
                setSmallSheets((prev) =>
                  prev.filter((s) => s.sheet?._id !== sheet?.sheet?._id),
                );
              }}
            />
          ))}
        </div>
      </DndContext>
      {children}
    </userContext.Provider>
  );
}
