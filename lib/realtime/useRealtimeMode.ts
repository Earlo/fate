import { useState } from 'react';

type RealtimeMode = 'ABLY' | 'SOCKET';

const resolveEnvMode = (): RealtimeMode | null => {
  const env = process.env.NEXT_PUBLIC_P2P_CONNECTION_TYPE?.toUpperCase();
  if (env === 'ABLY' || env === 'SOCKET') {
    return env;
  }
  return null;
};

export const useRealtimeMode = (): RealtimeMode => {
  const envMode = resolveEnvMode();
  const [mode] = useState<RealtimeMode>(envMode ?? 'SOCKET');

  return mode;
};
