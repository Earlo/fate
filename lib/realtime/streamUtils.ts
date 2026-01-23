type StreamController = ReadableStreamDefaultController<Uint8Array>;

type StreamSubscription = {
  controller: StreamController;
  keepAlive: ReturnType<typeof setInterval>;
};

type StreamStore = Map<string, Set<StreamSubscription>>;

const encoder = new TextEncoder();

const formatEvent = <T>(event: string, data: T) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export const sendEvent = <T>(
  controller: StreamController,
  event: string,
  data: T,
) => {
  controller.enqueue(encoder.encode(formatEvent(event, data)));
};

export const sendKeepAlive = (controller: StreamController) => {
  controller.enqueue(encoder.encode(': keep-alive\n\n'));
};

export const subscribeToStore = <T>(
  store: StreamStore,
  key: string,
  controller: StreamController,
  event: string,
  payload: T,
): StreamSubscription => {
  const subscriptions = store.get(key) ?? new Set<StreamSubscription>();
  const keepAlive = setInterval(() => sendKeepAlive(controller), 25000);
  const subscription = { controller, keepAlive };
  subscriptions.add(subscription);
  store.set(key, subscriptions);
  sendEvent(controller, event, payload);
  return subscription;
};

export const unsubscribeFromStore = (
  store: StreamStore,
  key: string,
  subscription: StreamSubscription,
) => {
  const subscriptions = store.get(key);
  if (!subscriptions) return;
  subscriptions.delete(subscription);
  clearInterval(subscription.keepAlive);
  if (subscriptions.size === 0) {
    store.delete(key);
  }
};

export const publishToStore = <T>(
  store: StreamStore,
  key: string,
  event: string,
  payload: T,
) => {
  const subscriptions = store.get(key);
  if (!subscriptions) return;
  const stale: StreamSubscription[] = [];
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

export type { StreamController, StreamStore, StreamSubscription };
