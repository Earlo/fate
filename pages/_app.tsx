import '@/styles/globals.css';
import TopBar from '@/components/layout/topBar';
import Footer from '@/components/layout/footer';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import type { AppProps } from 'next/app';
interface MyAppProps extends AppProps {
  pageProps: {
    session: Session | null | undefined;
  };
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: MyAppProps) {
  return (
    <SessionProvider session={session}>
      <div className="flex min-h-[100dvh] flex-col">
        <TopBar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </SessionProvider>
  );
}
