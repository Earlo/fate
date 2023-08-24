import AuthForm from '../components/authForm';
import CharacterForm from '../components/charachterForm';
import Button from '@/components/generic/button';
import { CharacterSheetT } from '@/schemas/sheet';
import CharacterButton from '@/components/dashboard/charachterButton';
import CharachterSheet from '@/components/dashboard/charachterSheet';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [CharacterForms, setCharacterForms] = useState<CharacterSheetT[]>([]);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterSheetT | null>(null);

  const toggleSelectedCharachter = (character: CharacterSheetT) => {
    setSelectedCharacter((currentChar) =>
      currentChar?.name === character.name ? null : character,
    );
  };
  useEffect(() => {
    if (session) {
      fetch(`/api/sheets?id=${session.user.id}`)
        .then((response) => response.json())
        .then((data) => setCharacterForms(data));
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
          {CharacterForms.map((sheet) => (
            <CharacterButton
              key={sheet.name}
              name={sheet.name}
              highConcept={sheet.aspects[0]}
              onClick={() => toggleSelectedCharachter(sheet)}
            />
          ))}
        </div>
        {selectedCharacter && (
          <CharachterSheet character={selectedCharacter} editable={false} />
        )}
        {showSheetForm && (
          <CharacterForm onClose={() => setShowSheetForm(false)} />
        )}
      </div>
    );
  }

  return <AuthForm />;
}
