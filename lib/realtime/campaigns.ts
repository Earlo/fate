import type { InboundMessage, RealtimeChannel, RealtimePresence } from 'ably';
import { getAblyRealtime, getAblyRest, isAblyEnabled } from './ably';
import type {
  CampaignChatPayload,
  CampaignEventPayload,
  CampaignLogPayload,
  CampaignStreamPayload,
} from './campaignTypes';
import {
  joinEvent,
  leaveEvent,
  nameChangedEvent,
  rollEvent,
} from './eventLogMessages';
import {
  getPresenceKey,
  getViewerLabel,
  mapPresenceMembers,
  type PresenceData,
} from './presence';

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

const publishEventLog = async (
  campaignId: string,
  payload: CampaignLogPayload,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablyCampaignChannel(campaignId));
    await channel.publish('event-log', payload);
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
      await publishEventLog(
        campaignId,
        nameChangedEvent(campaignId, previousLabel, nextLabel),
      );
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
    void publishEventLog(
      campaignId,
      nameChangedEvent(campaignId, previousLabel, nextLabel),
    );
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
      void publishEventLog(
        campaignId,
        nameChangedEvent(campaignId, previousLabel, nextLabel),
      );
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
  void publishEventLog(
    campaignId,
    joinEvent(campaignId, getViewerLabel(viewer)),
  );
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
  void publishEventLog(
    campaignId,
    leaveEvent(campaignId, getViewerLabel(existing)),
  );
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
          await publishEventLog(
            campaignId,
            joinEvent(campaignId, getViewerLabel(viewer)),
          );
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
            await publishEventLog(
              campaignId,
              leaveEvent(campaignId, getViewerLabel(viewer)),
            );
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

export const publishCampaignUpdate = async (
  campaignId: string,
  payload: CampaignEventPayload,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablyCampaignChannel(campaignId));
    await channel.publish('campaign-updated', payload);
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

export const publishChatMessage = async (
  campaignId: string,
  payload: CampaignChatPayload,
) => {
  if (isAblyEnabled()) {
    const channel = getAblyRest().channels.get(ablyCampaignChannel(campaignId));
    await channel.publish('chat-message', payload);
    if (payload.kind === 'roll') {
      const label = payload.sender?.name || 'Someone';
      await publishEventLog(
        campaignId,
        rollEvent(
          campaignId,
          label,
          payload.createdAt,
          payload.roll?.total ?? 0,
        ),
      );
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
    void publishEventLog(
      campaignId,
      rollEvent(campaignId, label, payload.createdAt, payload.roll?.total ?? 0),
    );
  }
};
