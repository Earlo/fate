import Ably from 'ably';
import { getRealtimeMode } from './realtimeMode';

export const isAblyEnabled = () => getRealtimeMode() === 'ABLY';

const requireAblyKey = () => {
  const key = process.env.ABLY_API_KEY;
  if (!key) {
    throw new Error(
      'ABLY_API_KEY is required when NEXT_PUBLIC_P2P_CONNECTION_TYPE=ABLY',
    );
  }
  return key;
};

let realtimeClient: Ably.Realtime | null = null;
let restClient: Ably.Rest | null = null;

export const getAblyRealtime = () => {
  if (!realtimeClient) {
    realtimeClient = new Ably.Realtime({ key: requireAblyKey() });
  }
  return realtimeClient;
};

export const getAblyRest = () => {
  if (!restClient) {
    restClient = new Ably.Rest({ key: requireAblyKey() });
  }
  return restClient;
};
