import CharacterForm from '@/components/charachterForm';
import Button from '@/components/generic/button';
import { CharacterSheetT } from '@/schemas/sheet';
import CharacterButton from '@/components/dashboard/charachterButton';
import CharachterSheet from '@/components/dashboard/charachterSheet';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [charachters, setCharachters] = useState<CharacterSheetT[]>([]);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterSheetT | null>(null);

  useEffect(() => {
    if (session) {
      fetch(`/api/sheets?id=${session.user.id}`)
        .then((response) => response.json())
        .then((data) => setCharachters(data));
    }
  }, [session]);
  if (!session) {
    return <p>Loading...</p>;
  }
  console.log(session);
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
        {charachters.map((sheet) => (
          <CharacterButton
            key={sheet._id}
            name={sheet.name}
            highConcept={sheet.aspects[0]}
            imageUrl={sheet.icon}
            onClick={() => setSelectedCharacter(sheet)}
          />
        ))}
      </div>
      {selectedCharacter && (
        <CharachterSheet
          key={selectedCharacter._id}
          character={selectedCharacter}
          editable={selectedCharacter.controlledBy === session.user.id}
          setCharachters={setCharachters}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
      {showSheetForm && (
        <CharacterForm onClose={() => setShowSheetForm(false)} />
      )}
    </div>
  );
}
