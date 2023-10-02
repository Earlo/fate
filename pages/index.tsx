import BaseLayout from '@/components/layout/baseLayout';
import Dashboard from '@/components/dashboard/board';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/get-started');
  };

  const handleLearnMore = () => {
    router.push('/about');
  };

  const LandingPage = () => (
    <BaseLayout className="bg-gradient-to-r from-blue-400 to-purple-500 p-20 text-white">
      <div className="container mx-auto text-center">
        <h1 className="mb-5 text-6xl font-extrabold">Fate Core</h1>
        <p className="mb-8 text-2xl">The Ultimate Character Sheet Tool</p>
        <div className="flex justify-center">
          <button
            onClick={handleGetStarted}
            className="mr-4 rounded-full bg-white px-4 py-2 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            Get Started
          </button>
          <button
            onClick={handleLearnMore}
            className="rounded-full border border-white bg-transparent px-4 py-2"
          >
            Learn More
          </button>
        </div>
      </div>
    </BaseLayout>
  );

  return (
    <>
      <Head>
        <title>Fate Core character sheet tool</title>
      </Head>
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
      {status === 'unauthenticated' && <LandingPage />}
    </>
  );
}
