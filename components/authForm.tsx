import FormContainer from './formContainer';
import Input from './generic/input';
import Button from './generic/button';
import CloseButton from './generic/closeButton';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
export default function AuthForm() {
  const [usernameExists, setUsernameExists] = useState(false);

  const handleUsernameChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      <FormContainer onSubmit={handleSubmit}>
        <Input name="username" required onChange={handleUsernameChange} />
        <Input name="password" type="password" required />
        <div className="flex items-center justify-between">
          <Button label={usernameExists ? 'Login' : 'Register'} type="submit" />
        </div>
      </FormContainer>
    </div>
  );
}
