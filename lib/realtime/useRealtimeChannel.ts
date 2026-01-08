import type { InboundMessage, RealtimeChannel } from 'ably';
import { useEffect } from 'react';
import { getAblyClient } from './ablyClient';
import { useRealtimeMode } from './useRealtimeMode';

type EventHandler = (payload: unknown) => void;

type UseRealtimeChannelOptions = {
  enabled?: boolean;
  clientId?: string;
  channel: string;
  streamUrl: string;
  events: Record<string, EventHandler>;
  onAblyAttach?: (channel: RealtimeChannel) => void | Promise<void>;
  onAblyDetach?: (channel: RealtimeChannel) => void | Promise<void>;
};

const parseEventData = (data: unknown) => {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const useRealtimeChannel = ({
  enabled = true,
  clientId,
  channel,
  streamUrl,
  events,
  onAblyAttach,
  onAblyDetach,
}: UseRealtimeChannelOptions) => {
  const realtimeMode = useRealtimeMode();

  useEffect(() => {
    if (!enabled) return;
    if (realtimeMode === 'ABLY') {
      const client = getAblyClient(clientId);
      const channelInstance = client.channels.get(channel);
      let active = true;
      const unsubscribers: Array<() => void> = [];
      Object.entries(events).forEach(([event, handler]) => {
        const wrapped = (message: InboundMessage) => {
          if (message.data) handler(message.data);
        };
        channelInstance.subscribe(event, wrapped);
        unsubscribers.push(() => channelInstance.unsubscribe(event, wrapped));
      });
      void (async () => {
        try {
          await channelInstance.attach();
          if (active && onAblyAttach) {
            await onAblyAttach(channelInstance);
          }
        } catch (error) {
          console.error('Failed to attach realtime channel:', error);
        }
      })();
      return () => {
        active = false;
        unsubscribers.forEach((unsubscribe) => unsubscribe());
        void (async () => {
          if (onAblyDetach) {
            await onAblyDetach(channelInstance);
          }
        })();
        channelInstance.detach();
      };
    }
    const source = new EventSource(streamUrl);
    const listeners = Object.entries(events).map(([event, handler]) => {
      const listener = (message: MessageEvent) => {
        const parsed = parseEventData(message.data);
        if (parsed === null) return;
        handler(parsed);
      };
      source.addEventListener(event, listener);
      return () => source.removeEventListener(event, listener);
    });
    return () => {
      listeners.forEach((remove) => remove());
      source.close();
    };
  }, [
    enabled,
    realtimeMode,
    clientId,
    channel,
    streamUrl,
    events,
    onAblyAttach,
    onAblyDetach,
  ]);
};
