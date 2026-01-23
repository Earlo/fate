import type { InboundMessage } from 'ably';
import { getAblyRealtime, getAblyRest, isAblyEnabled } from './ably';
import {
  publishToStore,
  sendEvent,
  sendKeepAlive,
  subscribeToStore,
  unsubscribeFromStore,
  type StreamController,
  type StreamStore,
} from './streamUtils';

type SheetEventPayload = {
  sheetId: string;
  ownerId?: string;
  updatedAt?: string;
  deleted?: boolean;
};

type SheetStreamStore = StreamStore;
const ablySheetChannel = (sheetId: string) => `sheet:${sheetId}`;
const ablySheetListChannel = (ownerId: string) => `sheet-list:${ownerId}`;

const getSheetStore = () => {
  const globalStore = globalThis as typeof globalThis & {
    __sheetStreamStore?: SheetStreamStore;
  };
  if (!globalStore.__sheetStreamStore) {
    globalStore.__sheetStreamStore = new Map();
  }
  return globalStore.__sheetStreamStore;
};

const getOwnerStore = () => {
  const globalStore = globalThis as typeof globalThis & {
    __sheetOwnerStreamStore?: SheetStreamStore;
  };
  if (!globalStore.__sheetOwnerStreamStore) {
    globalStore.__sheetOwnerStreamStore = new Map();
  }
  return globalStore.__sheetOwnerStreamStore;
};

const subscribeSheetStore = (
  store: SheetStreamStore,
  key: string,
  controller: StreamController,
  event: string,
) =>
  subscribeToStore(store, key, controller, event, {
    sheetId: key,
  });

export const subscribeSheet = (
  sheetId: string,
  controller: StreamController,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRealtime().channels.get(ablySheetChannel(sheetId));
    const keepAlive = setInterval(() => sendKeepAlive(controller), 25000);
    const handler = (message: InboundMessage) => {
      if (!message.data) return;
      sendEvent(controller, 'sheet-updated', message.data as SheetEventPayload);
    };
    sendEvent(controller, 'connected', { sheetId });
    void channel.subscribe('sheet-updated', handler);
    return () => {
      channel.unsubscribe('sheet-updated', handler);
      clearInterval(keepAlive);
    };
  }
  const store = getSheetStore();
  const subscription = subscribeSheetStore(
    store,
    sheetId,
    controller,
    'connected',
  );
  return () => unsubscribeFromStore(store, sheetId, subscription);
};

export const subscribeSheetList = (
  ownerId: string,
  controller: StreamController,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRealtime().channels.get(
      ablySheetListChannel(ownerId),
    );
    const keepAlive = setInterval(() => sendKeepAlive(controller), 25000);
    const handler = (message: InboundMessage) => {
      if (!message.data) return;
      sendEvent(
        controller,
        'sheet-list-updated',
        message.data as SheetEventPayload,
      );
    };
    sendEvent(controller, 'connected', { sheetId: ownerId });
    void channel.subscribe('sheet-list-updated', handler);
    return () => {
      channel.unsubscribe('sheet-list-updated', handler);
      clearInterval(keepAlive);
    };
  }
  const store = getOwnerStore();
  const subscription = subscribeSheetStore(
    store,
    ownerId,
    controller,
    'connected',
  );
  return () => unsubscribeFromStore(store, ownerId, subscription);
};

export const publishSheetUpdate = async (
  sheetId: string,
  payload: SheetEventPayload,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablySheetChannel(sheetId));
    await channel.publish('sheet-updated', payload);
    return;
  }
  const store = getSheetStore();
  publishToStore(store, sheetId, 'sheet-updated', payload);
};

export const publishSheetListUpdate = async (
  ownerId: string,
  payload: SheetEventPayload,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablySheetListChannel(ownerId));
    await channel.publish('sheet-list-updated', payload);
    return;
  }
  const store = getOwnerStore();
  publishToStore(store, ownerId, 'sheet-list-updated', payload);
};
