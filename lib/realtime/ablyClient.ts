import Ably from 'ably';

const getClientMode = () =>
  (process.env.NEXT_PUBLIC_P2P_CONNECTION_TYPE ?? 'SOCKET').toUpperCase();

export const isAblyClientEnabled = () => getClientMode() === 'ABLY';

let sharedClient: Ably.Realtime | null = null;
let sharedClientId: string | undefined;

export const getAblyClient = (clientId?: string) => {
  if (!sharedClient || sharedClientId !== clientId) {
    if (sharedClient) {
      sharedClient.close();
    }
    const authUrl = clientId
      ? `/api/ably/token?clientId=${encodeURIComponent(clientId)}`
      : '/api/ably/token';
    sharedClient = new Ably.Realtime({
      authUrl,
      authMethod: 'GET',
      autoConnect: true,
    });
    sharedClientId = clientId;
  }
  return sharedClient;
};

export const releaseAblyClient = (clientId?: string) => {
  if (!sharedClient) return;
  if (sharedClientId && clientId && sharedClientId !== clientId) return;
  sharedClient.close();
  sharedClient = null;
  sharedClientId = undefined;
};
