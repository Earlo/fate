import AuthForm from '../components/authForm';
import CharacterSheetForm from '../components/charachterSheet';
import Button from '@/components/generic/button';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showSheetForm, setShowSheetForm] = useState(false);

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
        {showSheetForm && (
          <CharacterSheetForm onClose={() => setShowSheetForm(false)} />
        )}
      </div>
    );
  }

  return <AuthForm />;
}
