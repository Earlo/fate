import '@/styles/globals.css';
import TopBar from '@/components/dashboard/topBar';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <TopBar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
