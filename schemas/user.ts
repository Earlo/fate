import { query } from '@/lib/postgres';
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

const userFields =
  'id, username, password, admin, created, updated' satisfies
    keyof UserRow as string;

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

export async function getUserById(
  id: string,
): Promise<UserModelT | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${userFields} FROM users WHERE id = $1`,
    [id],
  );
  return mapUser(rows[0]);
}

export async function getUserByUsername(
  username: string,
): Promise<UserModelT | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${userFields} FROM users WHERE username = $1`,
    [username],
  );
  return mapUser(rows[0]);
}

export async function createUser(
  user: Pick<UserModelT, 'username'> &
    Partial<Pick<UserModelT, 'password' | 'admin'>>,
): Promise<UserModelT | null> {
  const id = randomUUID();
  const { rows } = await query<UserRow>(
    `
    INSERT INTO users (id, username, password, admin)
    VALUES ($1, $2, $3, COALESCE($4, false))
    RETURNING ${userFields}
  `,
    [id, user.username, user.password ?? null, user.admin ?? false],
  );
  return mapUser(rows[0]);
}
