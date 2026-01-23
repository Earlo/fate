import type { RealtimeChannel } from 'ably';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getAblyClient } from './ablyClient';
import type { ChatMessage, LogEntry, PresenceEntry } from './campaignTypes';
import { joinEvent, leaveEvent, nameChangedEvent } from './eventLogMessages';
import { getPresenceKey, getViewerLabel, mapPresenceMembers } from './presence';
import { useRealtimeChannel } from './useRealtimeChannel';
import { useRealtimeMode } from './useRealtimeMode';

type CampaignRealtimeOptions = {
  campaignId?: string;
  viewerId?: string;
  viewerIsGuest?: boolean;
  username?: string;
  onCampaignUpdated?: () => void;
  onChatMessage?: (message: ChatMessage) => void;
  onEventLog?: (entry: LogEntry) => void;
  onPresenceUpdated?: (presence: PresenceEntry[]) => void;
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
    async (channel: RealtimeChannel, payload: LogEntry) => {
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
        if (payload) onChatMessage?.(payload as ChatMessage);
      },
      'event-log': (payload: unknown) => {
        if (payload) onEventLog?.(payload as LogEntry);
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
        await publishEventLog(
          channel,
          joinEvent(campaignId ?? '', getViewerLabel(viewerInfo)),
        );
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
        await publishEventLog(
          channel,
          leaveEvent(campaignId ?? '', getViewerLabel(viewerInfo)),
        );
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
            await channel.publish(
              'event-log',
              nameChangedEvent(campaignId, previousLabel, nextLabel),
            );
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
