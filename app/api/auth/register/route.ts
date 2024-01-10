import { UserModel, UserModelT } from '@/schemas/user';
import connect from '@/lib/mongo';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';
connect();

interface RegistrationInput {
  username: string;
  password: string;
}

export async function POST(req: Request) {
  const { username, password }: RegistrationInput = await req.json();
  const hashedPassword = await hash(password, 10);
  const existingUser = await UserModel.findOne<UserModelT>({ username });
  if (existingUser) {
    return NextResponse.json(
      { error: 'Username already exists' },
      { status: 400 },
    );
  }
  const newUser = await UserModel.create<UserModelT>({
    username,
    password: hashedPassword,
  });
  return NextResponse.json({ _id: newUser._id }, { status: 201 });
}
