import BaseLayout from '@/components/layout/baseLayout';
import Dashboard from '@/components/dashboard/board';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect, useRef } from 'react';

const diceSides = ['+', '-', ' '];
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const backgrounDice = Array.from(Array(4).keys()).map((_, i) => (
    <div
      key={i}
      id={`dice-${i}`}
      className="animate-float absolute flex h-24 w-24 items-center justify-center rounded border-2 border-slate-950 bg-transparent text-6xl font-bold leading-none text-black opacity-20"
    >
      <div id={'face'} className="mt-[-13px]">
        {diceSides[Math.floor(Math.random() * diceSides.length)]}
      </div>
    </div>
  ));

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
      const angle = Math.random() * Math.PI * 2;
      const rotation = Math.random() * 10 - 5;
      const angularMomentum = Math.random() - 0.5;
      el.style.left = `${initialX}px`;
      el.style.top = `${initialY}px`;
      const side = diceSides[Math.floor(Math.random() * diceSides.length)];
      // Remove the 'hidden' class and add 'flex' class
      el.classList.remove('hidden');
      el.classList.add('flex');
      const jiggleScale = 1;
      return { el, angle, rotation, angularMomentum, side, jiggleScale };
    });

    const updatePosition = ({
      el,
      angle,
      rotation,
      side,
      jiggleScale,
    }: {
      el: HTMLElement;
      angle: number;
      rotation: number;
      side: string;
      jiggleScale: number;
    }) => {
      const x = parseFloat(el.style.left || '0');
      const y = parseFloat(el.style.top || '0');
      const distance = 1;
      let newX = x + Math.cos(angle) * distance;
      let newY = y + Math.sin(angle) * distance;
      // Boundary checks
      if (newX > window.innerWidth) newX = -150;
      if (newX < -150) newX = window.innerWidth;
      if (newY > window.innerHeight) newY = -150;
      if (newY < -150) newY = window.innerHeight;

      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      el.style.transform = `rotate(${rotation}deg) scale(${jiggleScale})`;
      el.classList.remove('hidden');
      el.classList.add('flex');
      const face = el.querySelector('#face') as HTMLElement;
      if (face) {
        face.innerText = side;
      }
    };

    const animate = () => {
      squareStates.forEach((state) => {
        updatePosition(state);
        state.angle += Math.random() * 0.01 - 0.005; // Slight random curve
        state.angularMomentum += Math.random() * 0.2 - 0.1; // Slight random rotation
        state.angularMomentum = Math.max(
          Math.min(state.angularMomentum, 2),
          -2,
        );
        state.rotation += state.angularMomentum;
        if (state.el.classList.contains('jiggle')) {
          state.jiggleScale = 1 + 0.4 * (Math.random() - 0.5);
        } else if (Math.random() < 0.01) {
          const newSide =
            diceSides[Math.floor(Math.random() * diceSides.length)];
          if (newSide !== state.side) {
            state.el.classList.add('jiggle');
            state.side = newSide;

            // Remove the jiggle class after animation completes
            setTimeout(() => {
              state.el.classList.remove('jiggle');
            }, 200);
          }
        } else {
          state.jiggleScale = 1;
        }
        updatePosition(state);
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, [backgrounDice]);

  const LandingPage = () => (
    <BaseLayout className="relative overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 text-white">
      <div
        ref={containerRef}
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
      >
        {backgrounDice}
      </div>
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
