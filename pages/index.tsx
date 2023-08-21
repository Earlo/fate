'use client';
import AuthForm from '../components/authForm';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();

  if (session) {
    return <div>Welcome, {session.user.username}!</div>; // Placeholder
  }

  return <AuthForm />;
}
