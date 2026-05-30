import type { RealtimeChannel } from 'ably';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getAblyClient } from './ablyClient';
import type { ChatMessage, LogEntry, PresenceEntry } from './campaignTypes';
import { getPresenceKey, getViewerLabel, mapPresenceMembers } from './presence';
import { getRealtimeMode } from './realtimeMode';
import { useRealtimeChannel } from './useRealtimeChannel';

type CampaignRealtimeOptions = {
  campaignId?: string;
  viewerId: string;
  username: string;
  onCampaignUpdated?: () => void;
  onChatMessage?: (message: ChatMessage) => void;
  onEventLog?: (entry: LogEntry) => void;
  onPresenceUpdated?: (presence: PresenceEntry[]) => void;
  useAbly?: boolean;
};

export const useCampaignRealtime = ({
  campaignId,
  viewerId,
  username,
  onCampaignUpdated,
  onChatMessage,
  onEventLog,
  onPresenceUpdated,
  useAbly = true,
}: CampaignRealtimeOptions) => {
  const realtimeMode = getRealtimeMode();
  const presenceLabelRef = useRef<string | null>(null);
  const presenceUnsubRef = useRef<(() => void) | null>(null);
  const latestUsernameRef = useRef(username);
  const isGuest = viewerId.startsWith('guest_');
  // The stream URL is the connection identity. Display name changes are sent
  // through presence updates so they do not force a leave/join cycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const streamUsername = useMemo(() => username, [campaignId, viewerId]);

  useEffect(() => {
    latestUsernameRef.current = username;
  }, [username]);

  const buildViewerInfo = useCallback(
    (name?: string) => ({
      id: viewerId,
      userId: viewerId,
      username: name,
    }),
    [viewerId],
  );

  const publishEventLog = useCallback(
    async (
      activeCampaignId: string,
      payload:
        | { kind: 'join' | 'leave'; label: string }
        | {
            kind: 'name-change';
            previousLabel: string;
            nextLabel: string;
          },
    ) => {
      try {
        await fetch(`/api/campaigns/${activeCampaignId}/event-log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
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
      params.set('userId', viewerId);
    }
    params.set('username', streamUsername);
    const query = params.toString();
    return `/api/campaigns/${campaignId}/stream?${query}`;
  }, [campaignId, streamUsername, viewerId]);

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
          userId: viewerId,
          username: streamUsername,
        });
      } catch (error) {
        console.error('Failed to enter presence:', error);
        return;
      }
      const viewerInfo = buildViewerInfo(streamUsername);
      presenceLabelRef.current = getViewerLabel(viewerInfo);
      if (!hadViewer) {
        await publishEventLog(campaignId ?? '', {
          kind: 'join',
          label: getViewerLabel(viewerInfo),
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
      streamUsername,
      viewerId,
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
        const label =
          presenceLabelRef.current ??
          getViewerLabel(buildViewerInfo(latestUsernameRef.current));
        await publishEventLog(campaignId ?? '', { kind: 'leave', label });
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
    useAbly,
  });

  useEffect(() => {
    if (!campaignId || !viewerId || !username) return;
    if (realtimeMode === 'ABLY' && useAbly) {
      const client = getAblyClient(viewerId);
      const channel = client.channels.get(`campaign:${campaignId}`);
      const viewerInfo = buildViewerInfo(username);
      const previousLabel =
        presenceLabelRef.current ?? getViewerLabel(buildViewerInfo(username));
      const nextLabel = getViewerLabel(viewerInfo);
      const isInitialNameForUser =
        !isGuest && Boolean(username) && previousLabel === viewerId;
      void (async () => {
        try {
          await channel.presence.update({
            viewerId,
            userId: viewerId,
            username,
          });
          if (previousLabel !== nextLabel && !isInitialNameForUser) {
            await publishEventLog(campaignId, {
              kind: 'name-change',
              previousLabel,
              nextLabel,
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
    isGuest,
    publishEventLog,
    useAbly,
  ]);
};
