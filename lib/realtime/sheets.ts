type SheetEventPayload = {
  sheetId: string;
  ownerId?: string;
  updatedAt?: string;
  deleted?: boolean;
};

type StreamController = ReadableStreamDefaultController<Uint8Array>;

type SheetStreamSubscription = {
  controller: StreamController;
  keepAlive: ReturnType<typeof setInterval>;
};

type SheetStreamStore = Map<string, Set<SheetStreamSubscription>>;

const encoder = new TextEncoder();

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

const formatEvent = (event: string, data: SheetEventPayload) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const sendEvent = (
  controller: StreamController,
  event: string,
  data: SheetEventPayload,
) => {
  controller.enqueue(encoder.encode(formatEvent(event, data)));
};

const sendKeepAlive = (controller: StreamController) => {
  controller.enqueue(encoder.encode(': keep-alive\n\n'));
};

const subscribeToStore = (
  store: SheetStreamStore,
  key: string,
  controller: StreamController,
  event: string,
) => {
  const subscriptions = store.get(key) ?? new Set<SheetStreamSubscription>();
  const keepAlive = setInterval(() => sendKeepAlive(controller), 25000);
  const subscription = { controller, keepAlive };
  subscriptions.add(subscription);
  store.set(key, subscriptions);
  sendEvent(controller, event, { sheetId: key });
  return subscription;
};

const unsubscribeFromStore = (
  store: SheetStreamStore,
  key: string,
  subscription: SheetStreamSubscription,
) => {
  const subscriptions = store.get(key);
  if (!subscriptions) return;
  subscriptions.delete(subscription);
  clearInterval(subscription.keepAlive);
  if (subscriptions.size === 0) {
    store.delete(key);
  }
};

const publishToStore = (
  store: SheetStreamStore,
  key: string,
  event: string,
  payload: SheetEventPayload,
) => {
  const subscriptions = store.get(key);
  if (!subscriptions) return;
  const stale: SheetStreamSubscription[] = [];
  subscriptions.forEach((subscription) => {
    try {
      sendEvent(subscription.controller, event, payload);
    } catch {
      stale.push(subscription);
    }
  });
  stale.forEach((subscription) =>
    unsubscribeFromStore(store, key, subscription),
  );
};

export const subscribeSheet = (
  sheetId: string,
  controller: StreamController,
) => {
  const store = getSheetStore();
  const subscription = subscribeToStore(
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
  const store = getOwnerStore();
  const subscription = subscribeToStore(
    store,
    ownerId,
    controller,
    'connected',
  );
  return () => unsubscribeFromStore(store, ownerId, subscription);
};

export const publishSheetUpdate = (
  sheetId: string,
  payload: SheetEventPayload,
) => {
  const store = getSheetStore();
  publishToStore(store, sheetId, 'sheet-updated', payload);
};

export const publishSheetListUpdate = (
  ownerId: string,
  payload: SheetEventPayload,
) => {
  const store = getOwnerStore();
  publishToStore(store, ownerId, 'sheet-list-updated', payload);
};
