import Footer from '@/components/layout/footer';
import TopBar from '@/components/layout/topBar';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import Provider from './providers';
import UserProvider from './userProvider';

export const metadata: Metadata = {
  title: 'Fate Character Sheet Creator',
  description:
    'A tool for creating and managning Fate Core style character sheets. The Fate Core font is © Evil Hat Productions, LLC and is used with permission. The Four Actions icons were designed by Jeremy Keller.',
};

const archivo = localFont({
  src: [
    {
      path: '../public/fonts/archivo/Archivo-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/archivo/Archivo-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'optional',
  variable: '--font-archivo',
});

const archivoBlack = localFont({
  src: [
    {
      path: '../public/fonts/archivo/Archivo-Black.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-archivo-black',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable}`}
    >
      <body className="font-archivo flex min-h-[100dvh] flex-col">
        <Provider>
          <UserProvider>
            <TopBar />
            {children}
            <Footer />
          </UserProvider>
        </Provider>
      </body>
    </html>
  );
}
