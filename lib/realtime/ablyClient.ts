import Ably from 'ably';

const clients = new Map<string, Ably.Realtime>();

const buildClientId = (viewerId?: string) => viewerId ?? 'anon';

export const getAblyClient = (viewerId?: string) => {
  const clientId = buildClientId(viewerId);
  const existing = clients.get(clientId);
  if (existing) return existing;
  const authUrl = `/api/ably/token?clientId=${encodeURIComponent(clientId)}`;
  const client = new Ably.Realtime({
    authUrl,
    authMethod: 'GET',
    autoConnect: true,
  });
  clients.set(clientId, client);
  return client;
};

export const releaseAblyClient = (viewerId?: string) => {
  const clientId = buildClientId(viewerId);
  const client = clients.get(clientId);
  if (!client) return;
  client.close();
  clients.delete(clientId);
};
