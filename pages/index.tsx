import AuthForm from '@/components/authForm';
import Dashboard from '@/components/dashboard/board';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
      {status === 'loading' && (
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {status === 'authenticated' && session && <Dashboard />}
      {status === 'unauthenticated' && (
        <div className="mx-auto w-full max-w-xs pt-8">
          <AuthForm />
        </div>
      )}
    </>
  );
}
