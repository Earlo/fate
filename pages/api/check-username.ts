import { UserModel } from '@/schemas/user';
import connect from '@/lib/mongo';
import type { NextApiRequest, NextApiResponse } from 'next';
connect();

export default async function checkUsername(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const { username } = req.body;
  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    return res.status(200).json(true);
  }
  return res.status(200).json(false);
}
