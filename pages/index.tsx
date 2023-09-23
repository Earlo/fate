import BaseLayout from '@/components/layout/baseLayout';
import AuthForm from '@/components/authForm';
import Dashboard from '@/components/dashboard/board';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
      {status === 'loading' && (
        <BaseLayout className="items-center justify-center">
          <LoadingSpinner />
        </BaseLayout>
      )}
      {status === 'authenticated' && session && (
        <BaseLayout>
          <Dashboard />
        </BaseLayout>
      )}
      {status === 'unauthenticated' && (
        <BaseLayout className="mx-auto pt-8">
          <AuthForm />
        </BaseLayout>
      )}
    </>
  );
}
