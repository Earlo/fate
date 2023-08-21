'use client';
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function AuthForm() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (session) {
    return <div>Placeholder for logged-in user</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;

    if (mode === 'login') {
      signIn('credentials', { username, password });
    } else {
      // Registration logic
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, action: 'register' }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        // Redirect or show success message
      } else {
        // Show error message
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" name="username" required />
      </label>
      <label>
        Password:
        <input type="password" name="password" required />
      </label>
      <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Register' : 'Login'}
      </button>
    </form>
  );
}
