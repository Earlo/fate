import BaseLayout from '@/components/layout/baseLayout';
import Dashboard from '@/components/dashboard/board';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect, useRef } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const squares = Array.from(
      container.querySelectorAll('.animate-float'),
    ) as HTMLElement[];
    // Initialize squares with random positions, sizes, and angles
    const squareStates = squares.map((el) => {
      const initialX = Math.random() * window.innerWidth;
      const initialY = Math.random() * window.innerHeight;
      const size = 40;
      const angle = Math.random() * Math.PI * 2;
      const rotation = Math.random() * 10 - 5;

      el.style.left = `${initialX}px`;
      el.style.top = `${initialY}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;

      return { el, angle, rotation };
    });

    const updatePosition = ({
      el,
      angle,
      rotation,
    }: {
      el: HTMLElement;
      angle: number;
      rotation: number;
    }) => {
      const x = parseFloat(el.style.left || '0');
      const y = parseFloat(el.style.top || '0');
      const distance = 2;

      let newX = x + Math.cos(angle) * distance;
      let newY = y + Math.sin(angle) * distance;

      // Boundary checks
      if (newX > window.innerWidth) newX = -50;
      if (newX < -50) newX = window.innerWidth;
      if (newY > window.innerHeight) newY = -50;
      if (newY < -50) newY = window.innerHeight;

      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      el.style.transform = `rotate(${rotation}deg)`;
    };

    const animate = () => {
      squareStates.forEach((state) => {
        updatePosition(state);
        state.angle += Math.random() * 0.01 - 0.005; // Slight random curve
        state.rotation += Math.random() * 0.2 - 0.1; // Slight random rotation
      });
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const LandingPage = () => (
    <BaseLayout className="relative overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 text-white">
      <div
        ref={containerRef}
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
      >
        {Array.from(Array(100).keys()).map((_, i) => (
          <div
            key={i}
            className="animate-float absolute justify-center border-2 border-slate-950 bg-red-200 text-center align-middle font-fate font-bold text-red-500"
          />
        ))}
      </div>
      <div className="container mx-auto text-center">
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
          <button
            onClick={() => router.push('/about')}
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
