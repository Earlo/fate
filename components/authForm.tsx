'use client';
import { checkUsernameExists, registerUser } from '@/lib/apiHelpers/auth';
import { signIn } from 'next-auth/react';
import { ChangeEvent, FormEvent, useState } from 'react';
import FormContainer from './formContainer';
import Button from './generic/button';
import LabeledInput from './generic/labeledInput';
interface AuthFormProps {
  onClose?: () => void;
}

export default function AuthForm({ onClose }: AuthFormProps) {
  const [usernameExists, setUsernameExists] = useState(false);

  const handleUsernameChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const username = e.target.value;
    const exists = await checkUsernameExists(username);
    setUsernameExists(exists);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;
    if (usernameExists) {
      signIn('credentials', { username, password });
    } else {
      const ok = await registerUser(username, password);
      if (ok) {
        signIn('credentials', { username, password });
      } else {
        throw new Error('Failed to register user');
      }
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit} onClose={onClose}>
      <LabeledInput name="username" required onChange={handleUsernameChange} />
      <LabeledInput name="password" type="password" required />
      <div className="flex items-center justify-between pb-2">
        <Button label={usernameExists ? 'Login' : 'Register'} type="submit" />
      </div>
      <div className="flex items-center justify-between">
        <Button
          label={'Login with Google'}
          type="button"
          onClick={() => signIn('google')}
        />
      </div>
    </FormContainer>
  );
}
