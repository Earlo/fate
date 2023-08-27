import Button from '@/components/generic/button';
import { useSession, signOut } from 'next-auth/react';

const TopBar: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4">
      <div className="text-xl font-bold">
        {session
          ? 'Welcome, ' + session.user.username + '!'
          : 'Fate core character sheet app thingy'}
      </div>
      <div>
        {
          session ? <Button label="Log Out" onClick={() => signOut()} /> : null
          //<Button label="Log In" /* Add your login function here */ />
        }
      </div>
    </div>
  );
};

export default TopBar;
