import '@/styles/globals.css';
import Provider from './providers';
import UserProvider from './userProvider';
import TopBar from '@/components/layout/topBar';
import Footer from '@/components/layout/footer';
import { Archivo, Archivo_Black } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/schemas';

export const metadata: Metadata = {
  title: 'Fate Character Sheet Creator',
  description:
    'A tool for creating and managning Fate Core style character sheets. The Fate Core font is © Evil Hat Productions, LLC and is used with permission. The Four Actions icons were designed by Jeremy Keller.',
};

const archivo = Archivo({
  weight: ['400', '700'],
  display: 'optional',
  subsets: ['latin-ext'],
  variable: '--font-archivo',
});
const archivoBlack = Archivo_Black({
  weight: '400',
  display: 'swap',
  subsets: ['latin-ext'],
  variable: '--font-archivo-black',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoBlack.className}`}>
      <body className="min-h-[100dvh]">
        <Provider>
          <UserProvider>
            <div className="flex min-h-[100dvh] flex-col">
              <TopBar />
              {children}
              <Footer />
            </div>
          </UserProvider>
        </Provider>
      </body>
    </html>
  );
}
