'use client';
import Button from '@/components/generic/button';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { FC, useState } from 'react';
import AuthForm from '../authForm';

const TopBar: FC = () => {
  const { data: session } = useSession();
  const [showAuthForm, setShowAuthForm] = useState(false);
  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 text-white">
      <Link className={'text-xl font-bold hover:opacity-20'} href="/">
        Home
      </Link>
      <div className="hidden pl-4 text-xl font-bold sm:block">
        {session
          ? 'Welcome, ' + session.user.username + '!'
          : 'Fate core character sheet app'}
      </div>
      <div>
        {session ? (
          <Button label="Log Out" onClick={() => signOut()} />
        ) : (
          <Button label="Sign In" onClick={() => setShowAuthForm(true)} />
        )}
      </div>
      {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} />}
    </div>
  );
};

export default TopBar;
