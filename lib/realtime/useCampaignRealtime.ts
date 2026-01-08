import type { PresenceMessage, RealtimeChannel } from 'ably';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getAblyClient } from './ablyClient';
import type {
  CampaignChatMessage,
  CampaignLogEntry,
  PresenceEntry,
} from './campaignTypes';
import { useRealtimeChannel } from './useRealtimeChannel';
import { useRealtimeMode } from './useRealtimeMode';

type CampaignRealtimeOptions = {
  campaignId?: string;
  viewerId?: string;
  viewerIsGuest?: boolean;
  username?: string;
  onCampaignUpdated?: () => void;
  onChatMessage?: (message: CampaignChatMessage) => void;
  onEventLog?: (entry: CampaignLogEntry) => void;
  onPresenceUpdated?: (presence: PresenceEntry[]) => void;
};

type PresenceData = {
  viewerId?: string;
  userId?: string;
  username?: string;
  guest?: boolean;
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

export const useCampaignRealtime = ({
  campaignId,
  viewerId,
  viewerIsGuest,
  username,
  onCampaignUpdated,
  onChatMessage,
  onEventLog,
  onPresenceUpdated,
}: CampaignRealtimeOptions) => {
  const realtimeMode = useRealtimeMode();
  const presenceLabelRef = useRef<string | null>(null);
  const presenceUnsubRef = useRef<(() => void) | null>(null);
  const initialUsernameRef = useRef<string | undefined>(username);

  useEffect(() => {
    if (username && !initialUsernameRef.current) {
      initialUsernameRef.current = username;
    }
  }, [username]);

  const buildViewerInfo = useCallback(
    (name?: string) => ({
      id: viewerId,
      userId: viewerIsGuest ? undefined : viewerId,
      username: name,
      guest: viewerIsGuest,
    }),
    [viewerId, viewerIsGuest],
  );

  const publishEventLog = useCallback(
    async (channel: RealtimeChannel, payload: CampaignLogEntry) => {
      try {
        await channel.publish('event-log', payload);
      } catch (error) {
        console.error('Failed to publish event log', error);
      }
    },
    [],
  );

  const refreshPresence = useCallback(
    async (channel: RealtimeChannel) => {
      if (!onPresenceUpdated) return;
      try {
        const members = await channel.presence.get();
        onPresenceUpdated(mapPresenceMembers(members));
      } catch (error) {
        console.error('Failed to load presence list', error);
      }
    },
    [onPresenceUpdated],
  );

  const handlePresenceEvent = useCallback(
    (payload: unknown) => {
      if (!onPresenceUpdated) return;
      if (!payload || typeof payload !== 'object') return;
      const presence =
        (payload as { presence?: PresenceEntry[] }).presence ?? [];
      onPresenceUpdated(presence);
    },
    [onPresenceUpdated],
  );

  const events = useMemo(
    () => ({
      'campaign-updated': () => {
        onCampaignUpdated?.();
      },
      'chat-message': (payload: unknown) => {
        if (payload) onChatMessage?.(payload as CampaignChatMessage);
      },
      'event-log': (payload: unknown) => {
        if (payload) onEventLog?.(payload as CampaignLogEntry);
      },
      'presence-updated': handlePresenceEvent,
    }),
    [handlePresenceEvent, onCampaignUpdated, onChatMessage, onEventLog],
  );

  const sseUrl = useMemo(() => {
    if (!campaignId) return '';
    const params = new URLSearchParams();
    if (viewerId) {
      if (viewerIsGuest) {
        params.set('guestId', viewerId);
      } else {
        params.set('userId', viewerId);
      }
    }
    if (initialUsernameRef.current) {
      params.set('username', initialUsernameRef.current);
    }
    const query = params.toString();
    return query
      ? `/api/campaigns/${campaignId}/stream?${query}`
      : `/api/campaigns/${campaignId}/stream`;
  }, [campaignId, viewerId, viewerIsGuest]);

  const handleAblyAttach = useCallback(
    async (channel: RealtimeChannel) => {
      const presenceHandler = () => {
        void refreshPresence(channel);
      };
      channel.presence.subscribe(presenceHandler);
      presenceUnsubRef.current = () =>
        channel.presence.unsubscribe(presenceHandler);
      if (!viewerId) {
        await refreshPresence(channel);
        return;
      }
      let hadViewer = false;
      try {
        const members = await channel.presence.get();
        hadViewer = members.some(
          (member) => getPresenceKey(member) === viewerId,
        );
        onPresenceUpdated?.(mapPresenceMembers(members));
      } catch (error) {
        console.error('Failed to load presence list', error);
      }
      try {
        await channel.presence.enter({
          viewerId,
          userId: viewerIsGuest ? undefined : viewerId,
          username: initialUsernameRef.current,
          guest: viewerIsGuest,
        });
      } catch (error) {
        console.error('Failed to enter presence:', error);
        return;
      }
      const viewerInfo = buildViewerInfo(initialUsernameRef.current);
      presenceLabelRef.current = getViewerLabel(viewerInfo);
      if (!hadViewer) {
        await publishEventLog(channel, {
          campaignId: campaignId ?? '',
          kind: 'join',
          message: `${getViewerLabel(viewerInfo)} joined`,
          createdAt: new Date().toISOString(),
        });
      }
      await refreshPresence(channel);
    },
    [
      buildViewerInfo,
      campaignId,
      onPresenceUpdated,
      publishEventLog,
      refreshPresence,
      viewerId,
      viewerIsGuest,
    ],
  );

  const handleAblyDetach = useCallback(
    async (channel: RealtimeChannel) => {
      presenceUnsubRef.current?.();
      presenceUnsubRef.current = null;
      if (!viewerId) {
        presenceLabelRef.current = null;
        return;
      }
      let remainingCount = 0;
      try {
        const members = await channel.presence.get();
        remainingCount = members.filter(
          (member) => getPresenceKey(member) === viewerId,
        ).length;
      } catch (error) {
        console.error('Failed to load presence list', error);
      }
      try {
        await channel.presence.leave();
      } catch (error) {
        console.error('Failed to leave presence:', error);
      }
      if (remainingCount <= 1) {
        const viewerInfo = buildViewerInfo(initialUsernameRef.current);
        await publishEventLog(channel, {
          campaignId: campaignId ?? '',
          kind: 'leave',
          message: `${getViewerLabel(viewerInfo)} left`,
          createdAt: new Date().toISOString(),
        });
      }
      presenceLabelRef.current = null;
    },
    [buildViewerInfo, campaignId, publishEventLog, viewerId],
  );

  useRealtimeChannel({
    enabled: Boolean(campaignId),
    clientId: viewerId,
    channel: campaignId ? `campaign:${campaignId}` : '',
    streamUrl: sseUrl,
    events,
    onAblyAttach: handleAblyAttach,
    onAblyDetach: handleAblyDetach,
  });

  useEffect(() => {
    if (!campaignId || !viewerId || !username) return;
    if (realtimeMode === 'ABLY') {
      const client = getAblyClient(viewerId);
      const channel = client.channels.get(`campaign:${campaignId}`);
      const viewerInfo = buildViewerInfo(username);
      const previousLabel =
        presenceLabelRef.current ??
        getViewerLabel(buildViewerInfo(initialUsernameRef.current));
      const nextLabel = getViewerLabel(viewerInfo);
      const isInitialNameForUser =
        !viewerIsGuest && Boolean(username) && previousLabel === viewerId;
      void (async () => {
        try {
          await channel.presence.update({
            viewerId,
            userId: viewerIsGuest ? undefined : viewerId,
            username,
            guest: viewerIsGuest,
          });
          if (previousLabel !== nextLabel && !isInitialNameForUser) {
            await channel.publish('event-log', {
              campaignId,
              kind: 'system',
              message: `${previousLabel} changed name to ${nextLabel}`,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Failed to update presence name', error);
        } finally {
          presenceLabelRef.current = nextLabel;
        }
      })();
      return;
    }
    const updateName = async () => {
      try {
        await fetch(`/api/campaigns/${campaignId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ viewerId, username }),
        });
      } catch (error) {
        console.error('Failed to update presence name', error);
      }
    };
    updateName();
  }, [
    buildViewerInfo,
    campaignId,
    realtimeMode,
    username,
    viewerId,
    viewerIsGuest,
  ]);
};
