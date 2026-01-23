'use client';
import { getCampaignById, updateCampaignAPI } from '@/lib/apiHelpers/campaigns';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import type {
  CampaignChatMessage,
  CampaignLogEntry,
  PresenceEntry,
} from '@/lib/realtime/campaignTypes';
import { useCampaignRealtime } from '@/lib/realtime/useCampaignRealtime';
import { useRealtimeChannel } from '@/lib/realtime/useRealtimeChannel';
import { PopulatedCampaignT, PopulatedGroup } from '@/schemas/campaign';
import { blankGroup } from '@/schemas/consts/blankCampaignSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedRefresh } from './useDebouncedRefresh';

export const useCampaign = (
  campaignId: string,
  viewer?: { id?: string; username?: string },
) => {
  const [campaign, setCampaign] = useState<PopulatedCampaignT>();
  const [isLoading, setIsLoading] = useState(true);
  const [presence, setPresence] = useState<PresenceEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<CampaignChatMessage[]>([]);
  const [eventLog, setEventLog] = useState<CampaignLogEntry[]>([]);
  const [viewerId, setViewerId] = useState<string | undefined>(viewer?.id);
  const [viewerIsGuest, setViewerIsGuest] = useState(false);
  const maxLogEntries = 100;
  const fetchCampaign = useCallback(
    async (showLoading = true) => {
      if (!campaignId) return;
      if (showLoading) setIsLoading(true);
      try {
        const data = await getCampaignById(campaignId);
        setCampaign(data);
      } catch (error) {
        console.error('Could not fetch campaign:', error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [campaignId],
  );

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  useEffect(() => {
    if (!campaignId) return;
    if (viewer?.id) {
      setViewerId(viewer.id);
      setViewerIsGuest(false);
      return;
    }
    if (typeof window === 'undefined') return;
    const storageKey = `campaign-guest-id-${campaignId}`;
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) {
      setViewerId(existing);
      setViewerIsGuest(true);
      return;
    }
    const guestId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `guest_${crypto.randomUUID()}`
        : `guest_${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(storageKey, guestId);
    setViewerId(guestId);
    setViewerIsGuest(true);
  }, [campaignId, viewer?.id]);

  const handleUpdate = useDebouncedRefresh(() => {
    fetchCampaign(false);
  }, 200);

  const handleChatMessage = useCallback(
    (message: CampaignChatMessage) => {
      setChatMessages((prev) => [...prev.slice(-maxLogEntries + 1), message]);
    },
    [maxLogEntries],
  );

  const handleEventLog = useCallback(
    (message: CampaignLogEntry) => {
      setEventLog((prev) => [...prev.slice(-maxLogEntries + 1), message]);
    },
    [maxLogEntries],
  );

  const handlePresence = useCallback((entries: PresenceEntry[]) => {
    setPresence(entries);
  }, []);

  useCampaignRealtime({
    campaignId,
    viewerId,
    viewerIsGuest,
    username: viewer?.username,
    onCampaignUpdated: handleUpdate,
    onChatMessage: handleChatMessage,
    onEventLog: handleEventLog,
    onPresenceUpdated: handlePresence,
  });

  const updateCampaign = useCallback(
    async (updatedCampaign: PopulatedCampaignT) => {
      setCampaign(updatedCampaign);
      await updateCampaignAPI(campaignId, updatedCampaign);
      // TODO maybe update campaign in state to match the response, in case backend does something
    },
    [campaignId],
  );

  const toggleCampaign = async (userId: string) => {
    if (campaign) {
      const updatedCampaign = { ...campaign };
      if (updatedCampaign.visibleTo.includes(userId)) {
        updatedCampaign.visibleTo = updatedCampaign.visibleTo.filter(
          (id) => id !== userId,
        );
      } else {
        updatedCampaign.visibleTo.push(userId);
      }
      await updateCampaignAPI(campaignId, updatedCampaign);
      setCampaign(updatedCampaign);
    }
  };

  const addGroup = async () => {
    if (campaign) {
      const newGroup = blankGroup();
      const updatedCampaign = { ...campaign };
      updatedCampaign.groups.push(newGroup);
      await updateCampaign(updatedCampaign);
    } else {
      console.error('Campaign not found');
    }
  };

  const updateGroup = async (
    groupIndex: number,
    updatedGroup?: PopulatedGroup,
  ) => {
    if (campaign) {
      if (!updatedGroup) {
        //delete group index
        const updatedCampaign = { ...campaign };
        updatedCampaign.groups.splice(groupIndex, 1);
        updateCampaign(updatedCampaign);
      } else {
        const updatedCampaign = { ...campaign };
        updatedCampaign.groups[groupIndex] = updatedGroup;
        updateCampaign(updatedCampaign);
      }
    }
  };

  const addNote = async () => {
    if (campaign) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.notes.push({
        name: 'New Note',
        content: '',
        visibleIn: [],
      });
      updateCampaign(updatedCampaign);
    }
  };

  const updateNote = async (
    updatedNote: {
      name: string;
      visibleIn: string[];
      content: string;
    },
    index: number,
  ) => {
    if (campaign) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.notes[index] = updatedNote;
      updateCampaign(updatedCampaign);
    }
  };

  const deleteNote = async (index: number) => {
    if (campaign) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.notes.splice(index, 1);
      updateCampaign(updatedCampaign);
    }
  };

  return {
    campaign,
    isLoading,
    presence,
    chatMessages,
    eventLog,
    viewerId,
    viewerIsGuest,
    updateCampaign,
    toggleCampaign,
    addGroup,
    updateGroup,
    addNote,
    deleteNote,
    updateNote,
  };
};

export const useCharacterSheets = (userId: string) => {
  const [allCharacters, setAllCharacters] = useState<CharacterSheetT[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCharacterSheetsByUserId(userId);
      setAllCharacters(data);
    };
    fetchData();
  }, [userId]);

  const refreshSheets = useCallback(async () => {
    const data = await getCharacterSheetsByUserId(userId);
    setAllCharacters(data);
  }, [userId]);

  const handleUpdate = useDebouncedRefresh(() => {
    void refreshSheets();
  }, 200);

  const realtimeEvents = useMemo(
    () => ({ 'sheet-list-updated': handleUpdate }),
    [handleUpdate],
  );

  useRealtimeChannel({
    enabled: Boolean(userId),
    clientId: userId,
    channel: userId ? `sheet-list:${userId}` : '',
    streamUrl: userId ? `/api/sheets/stream?userId=${userId}` : '',
    events: realtimeEvents,
  });

  return { allCharacters };
};
