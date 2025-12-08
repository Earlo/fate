import { createUser, getUserByUsername } from '@/schemas/user';
import { hash } from 'bcrypt';
import { NextResponse, type NextRequest } from 'next/server';

interface RegistrationInput {
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const { username, password }: RegistrationInput = await req.json();
  const hashedPassword = await hash(password, 10);
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return NextResponse.json(
      { error: 'Username already exists' },
      { status: 400 },
    );
  }
  const newUser = await createUser({
    username,
    password: hashedPassword,
  });
  if (!newUser?._id) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 },
    );
  }
  return NextResponse.json({ _id: newUser._id }, { status: 201 });
}
