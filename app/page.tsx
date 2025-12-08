'use client';
import Dashboard from '@/components/dashboard/board';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import BaseLayout from '@/components/layout/baseLayout';
import DiceBackground from '@/components/layout/diceBackground';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const LandingPage = () => (
  <DiceBackground>
    <div className="container mx-auto pt-20 text-center">
      <h1 className="mb-5 text-6xl font-extrabold">
        {/* Thanks for the name suggestion github copilot */}
        Sheetstorm
      </h1>
      <p className="mb-8 text-2xl">A Fate Core Character and Campaign Tool</p>
      <div className="flex justify-center">
        <div className="group relative inline-block">
          <button
            disabled
            className="mr-4 cursor-not-allowed rounded-full bg-white px-4 py-2 text-blue-500 opacity-50 hover:bg-blue-500 hover:text-white"
          >
            Get Started
          </button>
          <div className="absolute -bottom-16 left-0 hidden rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
            Beginner instructions coming soon
          </div>
        </div>
        <button className="rounded-full border border-white bg-transparent px-4 py-2">
          <Link href="/about">Learn More</Link>
        </button>
      </div>
    </div>
  </DiceBackground>
);

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
      {status === 'unauthenticated' && <LandingPage />}
    </>
  );
}
