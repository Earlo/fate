import { createUser, getUserByUsername } from '@/schemas/user';
import { hash } from 'bcrypt';
import { NextResponse, type NextRequest } from 'next/server';

interface RegistrationInput {
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // Validate password before hashing
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return NextResponse.json(
      { error: 'Password is required and must not be empty' },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long' },
      { status: 400 },
    );
  }

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
  if (!newUser?.id) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 },
    );
  }
  return NextResponse.json({ id: newUser.id }, { status: 201 });
}
