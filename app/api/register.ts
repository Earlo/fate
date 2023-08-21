import { client } from '@/utils/mongo';
import { hash } from 'bcrypt';
import type { NextApiRequest, NextApiResponse } from 'next';

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

  await client.connect();
  const db = client.db('fate');
  const usersCollection = db.collection('users');

  const existingUser = await usersCollection.findOne({ username });

  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  await usersCollection.insertOne({ username, password: hashedPassword });
  return res.status(201).end();
}
