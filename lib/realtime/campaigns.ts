type CampaignEventPayload = {
  campaignId: string;
  updatedAt?: string;
};

type StreamController = ReadableStreamDefaultController<Uint8Array>;

type CampaignStreamSubscription = {
  controller: StreamController;
  keepAlive: ReturnType<typeof setInterval>;
};

type CampaignStreamStore = Map<string, Set<CampaignStreamSubscription>>;

const encoder = new TextEncoder();

const getStreamStore = () => {
  const globalStore = globalThis as typeof globalThis & {
    __campaignStreamStore?: CampaignStreamStore;
  };
  if (!globalStore.__campaignStreamStore) {
    globalStore.__campaignStreamStore = new Map();
  }
  return globalStore.__campaignStreamStore;
};

const formatEvent = (event: string, data: CampaignEventPayload) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const sendEvent = (
  controller: StreamController,
  event: string,
  data: CampaignEventPayload,
) => {
  controller.enqueue(encoder.encode(formatEvent(event, data)));
};

const sendKeepAlive = (controller: StreamController) => {
  controller.enqueue(encoder.encode(': keep-alive\n\n'));
};

export const subscribeCampaign = (
  campaignId: string,
  controller: StreamController,
) => {
  const store = getStreamStore();
  const subscriptions =
    store.get(campaignId) ?? new Set<CampaignStreamSubscription>();
  const keepAlive = setInterval(() => sendKeepAlive(controller), 25000);
  const subscription = { controller, keepAlive };
  subscriptions.add(subscription);
  store.set(campaignId, subscriptions);
  sendEvent(controller, 'connected', { campaignId });
  return () => unsubscribeCampaign(campaignId, subscription);
};

export const unsubscribeCampaign = (
  campaignId: string,
  subscription: CampaignStreamSubscription,
) => {
  const store = getStreamStore();
  const subscriptions = store.get(campaignId);
  if (!subscriptions) return;
  subscriptions.delete(subscription);
  clearInterval(subscription.keepAlive);
  if (subscriptions.size === 0) {
    store.delete(campaignId);
  }
};

export const publishCampaignUpdate = (
  campaignId: string,
  payload: CampaignEventPayload,
) => {
  const store = getStreamStore();
  const subscriptions = store.get(campaignId);
  if (!subscriptions) return;
  const stale: CampaignStreamSubscription[] = [];
  subscriptions.forEach((subscription) => {
    try {
      sendEvent(subscription.controller, 'campaign-updated', payload);
    } catch {
      stale.push(subscription);
    }
  });
  stale.forEach((subscription) =>
    unsubscribeCampaign(campaignId, subscription),
  );
};
