'use client';

import { CharacterSheetT } from '@/schemas/sheet';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { useSession } from 'next-auth/react';
import { ReactNode, createContext, useState, useEffect } from 'react';

interface UserContextT {
  sheets: CharacterSheetT[];
  setSheets: React.Dispatch<React.SetStateAction<CharacterSheetT[]>>;
}
export const userContext = createContext<UserContextT>({
  sheets: [],
  setSheets: () => {},
});

export default function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const [sheets, setSheets] = useState<CharacterSheetT[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const data = await getCharacterSheetsByUserId(session.user._id);
        setSheets(data);
      }
    };
    fetchData();
    console.log('fetching data', session);
  }, [session, setSheets]);

  return (
    <userContext.Provider value={{ sheets, setSheets }}>
      {children}
    </userContext.Provider>
  );
}
