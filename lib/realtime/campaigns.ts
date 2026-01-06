type CampaignEventPayload = {
  campaignId: string;
  updatedAt?: string;
  presence?: {
    id: string;
    userId?: string;
    username?: string;
    guest?: boolean;
  }[];
};

type CampaignChatPayload = {
  campaignId: string;
  message: string;
  createdAt: string;
  sender?: { id?: string; name?: string; guest?: boolean };
  kind: 'chat' | 'roll';
  roll?: { dice: number[]; total: number };
};

type CampaignLogPayload = {
  campaignId: string;
  message: string;
  createdAt: string;
  kind: 'join' | 'leave' | 'roll' | 'system';
};

type CampaignStreamPayload =
  | CampaignEventPayload
  | CampaignChatPayload
  | CampaignLogPayload;

type StreamController = ReadableStreamDefaultController<Uint8Array>;

type CampaignStreamSubscription = {
  controller: StreamController;
  keepAlive: ReturnType<typeof setInterval>;
};

type CampaignStreamStore = Map<string, Set<CampaignStreamSubscription>>;
type CampaignPresenceStore = Map<
  string,
  Map<
    string,
    {
      id: string;
      userId?: string;
      username?: string;
      guest?: boolean;
      count: number;
    }
  >
>;

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

const getPresenceStore = () => {
  const globalStore = globalThis as typeof globalThis & {
    __campaignPresenceStore?: CampaignPresenceStore;
  };
  if (!globalStore.__campaignPresenceStore) {
    globalStore.__campaignPresenceStore = new Map();
  }
  return globalStore.__campaignPresenceStore;
};

const formatEvent = (event: string, data: CampaignStreamPayload) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const sendEvent = (
  controller: StreamController,
  event: string,
  data: CampaignStreamPayload,
) => {
  controller.enqueue(encoder.encode(formatEvent(event, data)));
};

const sendKeepAlive = (controller: StreamController) => {
  controller.enqueue(encoder.encode(': keep-alive\n\n'));
};

const getViewerLabel = (viewer: {
  username?: string;
  userId?: string;
  guest?: boolean;
  id?: string;
}) => {
  if (viewer.username) return viewer.username;
  if (viewer.guest) return 'Guest';
  return viewer.userId || viewer.id || 'Unknown';
};

const getPresenceList = (campaignId: string) => {
  const store = getPresenceStore();
  const campaignPresence = store.get(campaignId);
  if (!campaignPresence) return [];
  return Array.from(campaignPresence.values()).map(
    ({ id, userId, username, guest }) => ({
      id,
      userId,
      username,
      guest,
    }),
  );
};

const publishPresence = (campaignId: string) => {
  const presence = getPresenceList(campaignId);
  const store = getStreamStore();
  const subscriptions = store.get(campaignId);
  if (!subscriptions) return;
  subscriptions.forEach((subscription) => {
    sendEvent(subscription.controller, 'presence-updated', {
      campaignId,
      presence,
    });
  });
};

const publishEventLog = (campaignId: string, payload: CampaignLogPayload) => {
  const store = getStreamStore();
  const subscriptions = store.get(campaignId);
  if (!subscriptions) return;
  subscriptions.forEach((subscription) => {
    sendEvent(subscription.controller, 'event-log', payload);
  });
};

export const updatePresenceName = (
  campaignId: string,
  viewerId: string,
  username?: string,
) => {
  const store = getPresenceStore();
  const campaignPresence = store.get(campaignId);
  if (!campaignPresence) return;
  const existing = campaignPresence.get(viewerId);
  if (!existing) return;
  const previousLabel = getViewerLabel(existing);
  const nextLabel = getViewerLabel({ ...existing, username });
  if (previousLabel === nextLabel) return;
  campaignPresence.set(viewerId, { ...existing, username });
  store.set(campaignId, campaignPresence);
  publishPresence(campaignId);
  publishEventLog(campaignId, {
    campaignId,
    kind: 'system',
    message: `${previousLabel} changed name to ${nextLabel}`,
    createdAt: new Date().toISOString(),
  });
};

const addPresence = (
  campaignId: string,
  viewer: { id: string; userId?: string; username?: string; guest?: boolean },
) => {
  const store = getPresenceStore();
  const campaignPresence = store.get(campaignId) ?? new Map();
  const existing = campaignPresence.get(viewer.id);
  if (existing) {
    const previousLabel = getViewerLabel(existing);
    const nextLabel = getViewerLabel({
      ...existing,
      username: viewer.username ?? existing.username,
    });
    if (previousLabel !== nextLabel) {
      publishEventLog(campaignId, {
        campaignId,
        kind: 'system',
        message: `${previousLabel} changed name to ${nextLabel}`,
        createdAt: new Date().toISOString(),
      });
      campaignPresence.set(viewer.id, {
        ...existing,
        username: viewer.username ?? existing.username,
        count: existing.count,
      });
      store.set(campaignId, campaignPresence);
      return;
    }
    campaignPresence.set(viewer.id, {
      ...existing,
      username: viewer.username ?? existing.username,
      count: existing.count + 1,
    });
  } else {
    campaignPresence.set(viewer.id, { ...viewer, count: 1 });
  }
  store.set(campaignId, campaignPresence);
  publishEventLog(campaignId, {
    campaignId,
    kind: 'join',
    message: `${getViewerLabel(viewer)} joined`,
    createdAt: new Date().toISOString(),
  });
};

const removePresence = (campaignId: string, viewerId: string) => {
  const store = getPresenceStore();
  const campaignPresence = store.get(campaignId);
  if (!campaignPresence) return;
  const existing = campaignPresence.get(viewerId);
  if (!existing) return;
  const nextCount = existing.count - 1;
  if (nextCount <= 0) {
    campaignPresence.delete(viewerId);
  } else {
    campaignPresence.set(viewerId, { ...existing, count: nextCount });
  }
  if (campaignPresence.size === 0) {
    store.delete(campaignId);
  }
  publishEventLog(campaignId, {
    campaignId,
    kind: 'leave',
    message: `${getViewerLabel(existing)} left`,
    createdAt: new Date().toISOString(),
  });
};

export const subscribeCampaign = (
  campaignId: string,
  controller: StreamController,
  viewer?: { id: string; userId?: string; username?: string; guest?: boolean },
) => {
  const store = getStreamStore();
  const subscriptions =
    store.get(campaignId) ?? new Set<CampaignStreamSubscription>();
  const keepAlive = setInterval(() => sendKeepAlive(controller), 25000);
  const subscription = { controller, keepAlive };
  subscriptions.add(subscription);
  store.set(campaignId, subscriptions);
  sendEvent(controller, 'connected', { campaignId });
  if (viewer?.id) {
    addPresence(campaignId, viewer);
    publishPresence(campaignId);
  } else {
    sendEvent(controller, 'presence-updated', {
      campaignId,
      presence: getPresenceList(campaignId),
    });
  }
  return () => {
    unsubscribeCampaign(campaignId, subscription);
    if (viewer?.id) {
      removePresence(campaignId, viewer.id);
      publishPresence(campaignId);
    }
  };
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

export const publishChatMessage = (
  campaignId: string,
  payload: CampaignChatPayload,
) => {
  const store = getStreamStore();
  const subscriptions = store.get(campaignId);
  if (!subscriptions) return;
  subscriptions.forEach((subscription) => {
    sendEvent(subscription.controller, 'chat-message', payload);
  });
  if (payload.kind === 'roll') {
    const label = payload.sender?.name || 'Someone';
    publishEventLog(campaignId, {
      campaignId,
      kind: 'roll',
      message: `${label} rolled ${payload.roll?.total ?? 0}`,
      createdAt: payload.createdAt,
    });
  }
};
