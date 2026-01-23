import { fetchJson, fetchOk } from './base';

export const checkUsernameExists = async (
  username: string,
): Promise<boolean> => {
  if (!username) {
    return false;
  }
  try {
    return await fetchJson<boolean>('/api/auth/checkUsername', {
      method: 'POST',
      body: JSON.stringify({ username }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return false;
  }
};

export const registerUser = async (
  username: string,
  password: string,
): Promise<boolean> =>
  await fetchOk('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, action: 'register' }),
    headers: { 'Content-Type': 'application/json' },
  });
