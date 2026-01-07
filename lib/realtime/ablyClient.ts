import Ably from 'ably';

const clients = new Map<string, Ably.Realtime>();

const getTabId = () => {
  if (typeof window === 'undefined') return 'server';
  const key = 'ably-tab-id';
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  window.sessionStorage.setItem(key, id);
  return id;
};

const buildClientId = (viewerId?: string) => {
  const base = viewerId ?? 'anon';
  return `${base}:${getTabId()}`;
};

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
