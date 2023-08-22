import AuthForm from '../components/authForm';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  if (status === 'loading') {
    return <p>Loading...</p>;
  }
  if (session) {
    return (
      <div className="p-4 text-xl font-bold">
        Welcome, {session.user.username}!
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => signOut()}
        >
          log out
        </button>
      </div>
    );
  }

  return <AuthForm />;
}
