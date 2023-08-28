import AuthForm from '../authForm';
import Button from '@/components/generic/button';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const [showAuthForm, setShowAuthForm] = useState(false);
  return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4">
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
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-opacity-50 bg-black">
          <AuthForm onClose={() => setShowAuthForm(false)} />
        </div>
      )}
    </div>
  );
};

export default TopBar;
