import AuthForm from '../authForm';
import Button from '@/components/generic/button';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const [showAuthForm, setShowAuthForm] = useState(false);
  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 text-white">
      <div className="text-xl font-bold">
        {session
          ? 'Welcome, ' + session.user.username + '!'
          : 'Fate core character sheet app thingy'}
      </div>
      <div>
        {session ? (
          <Button label="Log Out" onClick={() => signOut()} />
        ) : (
          <Button label="Sign In" onClick={() => setShowAuthForm(true)} />
        )}
      </div>
      {showAuthForm && (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
          <AuthForm onClose={() => setShowAuthForm(false)} />
        </div>
      )}
    </div>
  );
};

export default TopBar;
