import FormContainer from './formContainer';
import Input from './generic/input';
import Button from './generic/button';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
interface AuthFormProps {
  onClose?: () => void;
}

export default function AuthForm({ onClose }: AuthFormProps) {
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
    <FormContainer onSubmit={handleSubmit} onClose={onClose}>
      <Input name="username" required onChange={handleUsernameChange} />
      <Input name="password" type="password" required />
      <div className="flex items-center justify-between">
        <Button label={usernameExists ? 'Login' : 'Register'} type="submit" />
      </div>
      <Button
        label={'Login with Google'}
        type="button"
        onClick={() => signIn('google')}
      ></Button>
    </FormContainer>
  );
}
