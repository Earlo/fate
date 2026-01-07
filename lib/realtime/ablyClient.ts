import Ably from 'ably';

const getClientMode = () =>
  (process.env.NEXT_PUBLIC_P2P_CONNECTION_TYPE ?? 'SOCKET').toUpperCase();

export const isAblyClientEnabled = () => getClientMode() === 'ABLY';

const clients = new Map<string, Ably.Realtime>();

export const getAblyClient = (clientId?: string) => {
  const key = clientId ?? 'default';
  const existing = clients.get(key);
  if (existing) return existing;
  const authUrl = clientId
    ? `/api/ably/token?clientId=${encodeURIComponent(clientId)}`
    : '/api/ably/token';
  const client = new Ably.Realtime({
    authUrl,
    authMethod: 'GET',
    autoConnect: true,
  });
  clients.set(key, client);
  return client;
};

export const releaseAblyClient = (clientId?: string) => {
  const key = clientId ?? 'default';
  const client = clients.get(key);
  if (!client) return;
  client.close();
  clients.delete(key);
};
