export const checkUsernameExists = async (
  username: string,
): Promise<boolean> =>
  username
    ? fetch('/api/auth/checkUsername', {
        method: 'POST',
        body: JSON.stringify({ username }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => (res.ok ? res.json() : false))
        .catch(() => false)
    : false;

export const registerUser = async (
  username: string,
  password: string,
): Promise<boolean> =>
  await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, action: 'register' }),
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.ok);
