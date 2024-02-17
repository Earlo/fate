'use client';
import { CharacterSheetT } from '@/schemas/sheet';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import CharacterForm from '@/components/characterForm';
import CharacterCard from '@/components/characterCard';
import { useSession } from 'next-auth/react';
import { ReactNode, createContext, useState, useEffect } from 'react';
import Draggable from 'react-draggable';

interface sheetWithContext {
  sheet?: CharacterSheetT;
  state: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  skills?: string[];
}
interface UserContextT {
  sheets: CharacterSheetT[];
  setSheets: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
  bigSheet?: sheetWithContext;
  smallSheets: sheetWithContext[];
  setSmallSheets: React.Dispatch<React.SetStateAction<sheetWithContext[]>>;
  setBigSheet: React.Dispatch<
    React.SetStateAction<sheetWithContext | undefined>
  >;
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
      <div className="absolute left-0 top-0 z-50">
        {bigSheet && (
          <CharacterForm
            initialSheet={bigSheet.sheet}
            onClose={() => setBigSheet(undefined)}
            state={bigSheet.state}
            campaignId={bigSheet.campaignId}
            skills={bigSheet.skills}
            onMinimize={() => {
              if (bigSheet.sheet !== undefined) {
                setSmallSheets((prev) => [...prev, bigSheet]);
              }
              setBigSheet(undefined);
            }}
          />
        )}
        {smallSheets.map((sheet) => (
          <Draggable key={sheet?.sheet?._id}>
            <div>
              <CharacterCard
                character={sheet?.sheet as CharacterSheetT}
                state={'view'}
                campaignId={sheet.campaignId}
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
            </div>
          </Draggable>
        ))}
      </div>
      {children}
    </userContext.Provider>
  );
}
