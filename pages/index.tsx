import AuthForm from '../components/authForm';
import Dashboard from '@/components/dashboard/dashBoard';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (session) {
    return <Dashboard />;
  }

  return <AuthForm />;
}
