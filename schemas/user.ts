import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export type UserModelT = {
  _id: string;
  username: string;
  password?: string | null;
  admin: boolean;
  created: Date;
  updated: Date;
};

type UserRow = {
  id: string;
  username: string;
  password: string | null;
  admin: boolean;
  created: Date;
  updated: Date;
};

const mapUser = (row?: UserRow | null): UserModelT | null =>
  row
    ? {
        _id: row.id,
        username: row.username,
        password: row.password,
        admin: row.admin,
        created: row.created,
        updated: row.updated,
      }
    : null;

export async function getUserById(id: string): Promise<UserModelT | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return mapUser(user as UserRow | null);
}

export async function getUserByUsername(
  username: string,
): Promise<UserModelT | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  return mapUser(user as UserRow | null);
}

export async function createUser(
  user: Pick<UserModelT, 'username'> &
    Partial<Pick<UserModelT, 'password' | 'admin'>>,
): Promise<UserModelT | null> {
  const id = randomUUID();
  const created = await prisma.user.create({
    data: {
      id,
      username: user.username,
      password: user.password ?? null,
      admin: user.admin ?? false,
    },
  });
  return mapUser(created as UserRow);
}
