'use client';
import { CharacterSheetT } from '@/schemas/sheet';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import CharacterForm from '@/components/characterForm';
import { useSession } from 'next-auth/react';
import { ReactNode, createContext, useState, useEffect } from 'react';

interface bigSheetT {
  sheet?: CharacterSheetT;
  state: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  skills?: string[];
}
interface UserContextT {
  sheets: CharacterSheetT[];
  setSheets: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
  bigSheet?: bigSheetT;
  smallSheets: CharacterSheetT[];
  setSmallSheets: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
  setBigSheet: React.Dispatch<React.SetStateAction<bigSheetT | undefined>>;
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
  const [bigSheet, setBigSheet] = useState<bigSheetT>();
  const [smallSheets, setSmallSheets] = useState<CharacterSheetT[]>([]);

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
          />
        )}
      </div>
      {children}
    </userContext.Provider>
  );
}
