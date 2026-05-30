import Ably from 'ably';

const clients = new Map<string, Ably.Realtime>();

const buildClientId = (viewerId?: string) => viewerId ?? 'anon';

export const getAblyClient = (viewerId?: string) => {
  const clientId = buildClientId(viewerId);
  const existing = clients.get(clientId);
  if (existing) return existing;
  const client = new Ably.Realtime({
    authUrl: '/api/ably/token',
    authMethod: 'GET',
    autoConnect: true,
  });
  clients.set(clientId, client);
  return client;
};
