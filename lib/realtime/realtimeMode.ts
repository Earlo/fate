type RealtimeMode = 'ABLY' | 'SOCKET';

const resolveRealtimeMode = (envValue?: string | null): RealtimeMode => {
  const normalized = envValue?.toUpperCase();
  if (normalized === 'ABLY' || normalized === 'SOCKET') {
    return normalized;
  }
  return 'SOCKET';
};

export const getRealtimeMode = (): RealtimeMode =>
  resolveRealtimeMode(process.env.NEXT_PUBLIC_P2P_CONNECTION_TYPE);

export type { RealtimeMode };
