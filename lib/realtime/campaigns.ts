import type {
  InboundMessage,
  PresenceMessage,
  RealtimeChannel,
  RealtimePresence,
} from 'ably';
import { getAblyRealtime, getAblyRest, isAblyEnabled } from './ably';

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
const ablyCampaignChannel = (campaignId: string) => `campaign:${campaignId}`;

type PresenceData = {
  viewerId?: string;
  userId?: string;
  username?: string;
  guest?: boolean;
};

const getPresenceMembers = (channel: RealtimeChannel) => channel.presence.get();

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
  if (viewer.guest) {
    const suffix = viewer.id ? viewer.id.slice(-4) : '0000';
    return `Guest#${suffix}`;
  }
  return viewer.userId || viewer.id || 'Unknown';
};

const getPresenceKey = (member: PresenceMessage) => {
  const data = (member.data as PresenceData | undefined) ?? {};
  return data.viewerId || data.userId || member.clientId || '';
};

const mapPresenceMembers = (members: PresenceMessage[]) => {
  const byViewerId = new Map<string, PresenceData & { id: string }>();
  members.forEach((member) => {
    const data = (member.data as PresenceData | undefined) ?? {};
    const viewerKey = getPresenceKey(member);
    if (!viewerKey) return;
    byViewerId.set(viewerKey, {
      id: viewerKey,
      userId: data.userId,
      username: data.username,
      guest: data.guest,
    });
  });
  return Array.from(byViewerId.values());
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
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablyCampaignChannel(campaignId));
    void channel.publish('event-log', payload);
    return;
  }
  const store = getStreamStore();
  const subscriptions = store.get(campaignId);
  if (!subscriptions) return;
  subscriptions.forEach((subscription) => {
    sendEvent(subscription.controller, 'event-log', payload);
  });
};

export const updatePresenceName = async (
  campaignId: string,
  viewerId: string,
  username?: string,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRealtime().channels.get(
      ablyCampaignChannel(campaignId),
    );
    const members = await getPresenceMembers(channel);
    const existing = members.find(
      (member) => getPresenceKey(member) === viewerId,
    );
    if (!existing) return;
    const existingData = (existing.data ?? {}) as PresenceData;
    const previousLabel = getViewerLabel({
      id: viewerId,
      userId: existingData.userId,
      username: existingData.username,
      guest: existingData.guest,
    });
    const nextLabel = getViewerLabel({
      id: viewerId,
      userId: existingData.userId,
      username,
      guest: existingData.guest,
    });
    const presence: RealtimePresence = channel.presence;
    try {
      await presence.updateClient(viewerId, { ...existingData, username });
    } catch (error) {
      console.error('Failed to update presence name:', error);
      return;
    }
    if (previousLabel !== nextLabel) {
      publishEventLog(campaignId, {
        campaignId,
        kind: 'system',
        message: `${previousLabel} changed name to ${nextLabel}`,
        createdAt: new Date().toISOString(),
      });
    }
    return;
  }
  const store = getPresenceStore();
  const campaignPresence = store.get(campaignId);
  if (!campaignPresence) return;
  const existing = campaignPresence.get(viewerId);
  if (!existing) return;
  const previousLabel = getViewerLabel(existing);
  const nextLabel = getViewerLabel({ ...existing, username });
  if (previousLabel === nextLabel) return;
  const isInitialNameForUser =
    !existing.username && existing.userId && previousLabel === existing.userId;
  campaignPresence.set(viewerId, { ...existing, username });
  store.set(campaignId, campaignPresence);
  publishPresence(campaignId);
  if (!isInitialNameForUser) {
    publishEventLog(campaignId, {
      campaignId,
      kind: 'system',
      message: `${previousLabel} changed name to ${nextLabel}`,
      createdAt: new Date().toISOString(),
    });
  }
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
  if (isAblyEnabled()) {
    const channel = getAblyRealtime().channels.get(
      ablyCampaignChannel(campaignId),
    );
    const presence: RealtimePresence = channel.presence;
    const keepAlive = setInterval(() => sendKeepAlive(controller), 25000);
    const unsubscribeHandlers = new Set<() => void>();
    const forwardEvent = (event: string) => {
      const handler = (message: InboundMessage) => {
        if (!message.data) return;
        sendEvent(controller, event, message.data as CampaignStreamPayload);
      };
      void channel.subscribe(event, handler);
      unsubscribeHandlers.add(() => channel.unsubscribe(event, handler));
    };
    sendEvent(controller, 'connected', { campaignId });
    forwardEvent('campaign-updated');
    forwardEvent('chat-message');
    forwardEvent('event-log');
    forwardEvent('presence-updated');

    const sendPresenceSnapshot = async () => {
      try {
        const members = await getPresenceMembers(channel);
        sendEvent(controller, 'presence-updated', {
          campaignId,
          presence: mapPresenceMembers(members),
        });
      } catch (error) {
        console.error('Failed to load presence list:', error);
      }
    };

    const presenceHandler = () => {
      void sendPresenceSnapshot();
    };
    void presence.subscribe(presenceHandler);
    unsubscribeHandlers.add(() => presence.unsubscribe(presenceHandler));

    if (viewer?.id) {
      void (async () => {
        let hadViewer = false;
        try {
          const members = await getPresenceMembers(channel);
          hadViewer = members.some(
            (member) => getPresenceKey(member) === viewer.id,
          );
        } catch (error) {
          console.error('Failed to read presence list:', error);
        }
        try {
          await presence.enterClient(viewer.id, {
            viewerId: viewer.id,
            userId: viewer.userId,
            username: viewer.username,
            guest: viewer.guest,
          });
        } catch (error) {
          console.error('Failed to enter presence:', error);
          return;
        }
        void sendPresenceSnapshot();
        if (!hadViewer) {
          publishEventLog(campaignId, {
            campaignId,
            kind: 'join',
            message: `${getViewerLabel(viewer)} joined`,
            createdAt: new Date().toISOString(),
          });
        }
      })();
    } else {
      void sendPresenceSnapshot();
    }

    return () => {
      unsubscribeHandlers.forEach((handler) => handler());
      clearInterval(keepAlive);
      if (viewer?.id) {
        void (async () => {
          let remainingCount = 0;
          try {
            const members = await getPresenceMembers(channel);
            remainingCount = members.filter(
              (member) => getPresenceKey(member) === viewer.id,
            ).length;
          } catch (error) {
            console.error('Failed to read presence list:', error);
          }
          try {
            await presence.leaveClient(viewer.id);
          } catch (error) {
            console.error('Failed to leave presence:', error);
            return;
          }
          void sendPresenceSnapshot();
          if (remainingCount <= 1) {
            publishEventLog(campaignId, {
              campaignId,
              kind: 'leave',
              message: `${getViewerLabel(viewer)} left`,
              createdAt: new Date().toISOString(),
            });
          }
        })();
      }
    };
  }
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
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablyCampaignChannel(campaignId));
    void channel.publish('campaign-updated', payload);
    return;
  }
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
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablyCampaignChannel(campaignId));
    void channel.publish('chat-message', payload);
    if (payload.kind === 'roll') {
      const label = payload.sender?.name || 'Someone';
      publishEventLog(campaignId, {
        campaignId,
        kind: 'roll',
        message: `${label} rolled ${payload.roll?.total ?? 0}`,
        createdAt: payload.createdAt,
      });
    }
    return;
  }
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
