'use client';
import { checkUsernameExists, registerUser } from '@/lib/apiHelpers/auth';
import { signIn } from 'next-auth/react';
import { ChangeEvent, useState } from 'react';
import FormContainer from './formContainer';
import Button from './generic/button';
import LabeledInput from './generic/labeledInput';
interface AuthFormProps {
  onClose?: () => void;
}

export default function AuthForm({ onClose }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameExists, setUsernameExists] = useState(false);

  const handleUsernameChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextUsername = e.target.value;
    setUsername(nextUsername);
    if (!nextUsername.trim()) {
      setUsernameExists(false);
      return;
    }
    const exists = await checkUsernameExists(nextUsername);
    setUsernameExists(exists);
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) return;
    if (usernameExists) {
      await signIn('credentials', { username: trimmedUsername, password });
      return;
    }
    const ok = await registerUser(trimmedUsername, password);
    if (!ok) {
      throw new Error('Failed to register user');
    }
    await signIn('credentials', { username: trimmedUsername, password });
  };

  return (
    <FormContainer onSubmit={handleSubmit} onClose={onClose}>
      <LabeledInput
        name="username"
        value={username}
        required
        onChange={handleUsernameChange}
      />
      <LabeledInput
        name="password"
        type="password"
        value={password}
        required
        onChange={(event) => setPassword(event.target.value)}
      />
      <div className="flex items-center justify-between pb-2">
        <Button label={usernameExists ? 'Login' : 'Register'} type="submit" />
      </div>
      <div className="flex items-center justify-between">
        <Button label="Login with Google" onClick={() => signIn('google')} />
      </div>
    </FormContainer>
  );
}
