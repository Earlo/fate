import AuthForm from '../components/authForm';
import CharacterSheetForm from '../components/charachterSheet';
import Button from '@/components/generic/button';
import { CharacterSheetT } from '@/schemas/sheet';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [characterSheets, setCharacterSheets] = useState<CharacterSheetT[]>([]);
  useEffect(() => {
    if (session) {
      fetch(`/api/sheets?id=${session.user.id}`)
        .then((response) => response.json())
        .then((data) => setCharacterSheets(data));
    }
  }, [session]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div className="p-4 text-xl font-bold">
        Welcome, {session.user.username}!
        <Button label="log out" onClick={() => signOut()} />
        <Button
          className="bg-green-500 hover:bg-green-700 "
          label="Create New Character Sheet"
          onClick={() => setShowSheetForm(true)}
        />
        <div>
          <h2>Your Character Sheets:</h2>
          {characterSheets.map((sheet) => (
            <div key={sheet.name}>{sheet.name}</div>
          ))}
        </div>
        {showSheetForm && (
          <CharacterSheetForm onClose={() => setShowSheetForm(false)} />
        )}
      </div>
    );
  }

  return <AuthForm />;
}
