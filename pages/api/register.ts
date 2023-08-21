import { UserModel } from '@/schemas/user';
import connect from '@/lib/mongo';
import { hash } from 'bcrypt';
import type { NextApiRequest, NextApiResponse } from 'next';
connect();

interface RegistrationInput {
  username: string;
  password: string;
}

export default async function register(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username, password }: RegistrationInput = req.body;
  const hashedPassword = await hash(password, 10);

  // Check for existing user by username
  const existingUser = await UserModel.findOne({ username });

  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Create new user
  await UserModel.create({ username, password: hashedPassword });

  return res.status(201).end();
}
