import type { PresenceMessage } from 'ably';
import type { PresenceEntry } from './campaignTypes';

export type PresenceData = {
  viewerId?: string;
  userId?: string;
  username?: string;
  guest?: boolean;
};

export const getViewerLabel = (viewer: {
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

export const getPresenceKey = (member: PresenceMessage) => {
  const data = (member.data as PresenceData | undefined) ?? {};
  return data.viewerId || data.userId || member.clientId || '';
};

export const mapPresenceMembers = (members: PresenceMessage[]) => {
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
  return Array.from(byViewerId.values()) as PresenceEntry[];
};
