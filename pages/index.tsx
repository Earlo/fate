import AuthForm from '../components/authForm';
import Dashboard from '@/components/dashboard/dashboard';
import TopBar from '@/components/dashboard/topBar';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
      <TopBar />
      {status === 'loading' && (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      )}
      {status === 'authenticated' && session && <Dashboard />}
      {status === 'unauthenticated' && <AuthForm />}
    </>
  );
}
