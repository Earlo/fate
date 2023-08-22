import Input from './input';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthForm() {
  const [usernameExists, setUsernameExists] = useState(false);

  const handleUsernameChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const username = e.target.value;
    const response = await fetch('/api/check-username', {
      method: 'POST',
      body: JSON.stringify({ username }),
      headers: { 'Content-Type': 'application/json' },
    });
    const exists = await response.json();
    setUsernameExists(exists);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;
    if (usernameExists) {
      signIn('credentials', { username, password });
    } else {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, action: 'register' }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        signIn('credentials', { username, password });
      } else {
        throw new Error(await response.text());
      }
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto mt-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <Input
          label="Username:"
          name="username"
          type="text"
          required
          onChange={handleUsernameChange}
        />
        <Input label="Password:" name="password" type="password" required />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {usernameExists ? 'Login' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
