import { useEffect, useState } from 'react';

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
  const [mode, setMode] = useState<RealtimeMode>(envMode ?? 'SOCKET');

  useEffect(() => {
    if (envMode) return;
    let active = true;
    const fetchMode = async () => {
      try {
        const res = await fetch('/api/realtime/mode');
        if (!res.ok) return;
        const data = (await res.json()) as { mode?: string };
        const nextMode =
          data.mode === 'ABLY' || data.mode === 'SOCKET'
            ? (data.mode as RealtimeMode)
            : null;
        if (active && nextMode) {
          setMode(nextMode);
        }
      } catch (error) {
        console.error('Failed to resolve realtime mode:', error);
      }
    };
    void fetchMode();
    return () => {
      active = false;
    };
  }, [envMode]);

  return mode;
};
