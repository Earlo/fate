import AuthForm from '../components/authForm';
import CharacterSheetForm from '../components/charachterSheet';
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
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline m-4"
          onClick={() => signOut()}
        >
          log out
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline m-4"
          onClick={() => setShowSheetForm(true)}
        >
          Create New Character Sheet
        </button>
        {showSheetForm && (
          <CharacterSheetForm onClose={() => setShowSheetForm(false)} />
        )}
      </div>
    );
  }

  return <AuthForm />;
}
