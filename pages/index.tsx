import AuthForm from '@/components/authForm';
import Dashboard from '@/components/dashboard/board';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
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
