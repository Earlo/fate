'use client';
import { getCampaignById, updateCampaignAPI } from '@/lib/apiHelpers/campaigns';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { PopulatedCampaignT, PopulatedGroup } from '@/schemas/campaign';
import { blankGroup } from '@/schemas/consts/blankCampaignSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { useCallback, useEffect, useRef, useState } from 'react';

type CampaignChatMessage = {
  campaignId: string;
  message: string;
  createdAt: string;
  sender?: { id?: string; name?: string; guest?: boolean };
  kind: 'chat' | 'roll';
  roll?: { dice: number[]; total: number };
};

type CampaignLogEntry = {
  campaignId: string;
  message: string;
  createdAt: string;
  kind: 'join' | 'leave' | 'roll' | 'system';
};

export const useCampaign = (
  campaignId: string,
  viewer?: { id?: string; username?: string },
) => {
  const [campaign, setCampaign] = useState<PopulatedCampaignT>();
  const [isLoading, setIsLoading] = useState(true);
  const [presence, setPresence] = useState<
    { id: string; userId?: string; username?: string; guest?: boolean }[]
  >([]);
  const [chatMessages, setChatMessages] = useState<CampaignChatMessage[]>([]);
  const [eventLog, setEventLog] = useState<CampaignLogEntry[]>([]);
  const [viewerId, setViewerId] = useState<string | undefined>(viewer?.id);
  const [viewerIsGuest, setViewerIsGuest] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialUsernameRef = useRef<string | undefined>(viewer?.username);
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

  useEffect(() => {
    if (viewer?.username && !initialUsernameRef.current) {
      initialUsernameRef.current = viewer.username;
    }
  }, [viewer?.username]);

  useEffect(() => {
    if (!campaignId) return;
    if (!viewerId) return;
    const params = new URLSearchParams();
    if (viewerId) {
      if (viewerIsGuest) {
        params.set('guestId', viewerId);
      } else {
        params.set('userId', viewerId);
      }
      if (initialUsernameRef.current) {
        params.set('username', initialUsernameRef.current);
      }
    }
    const streamUrl = params.toString()
      ? `/api/campaigns/${campaignId}/stream?${params.toString()}`
      : `/api/campaigns/${campaignId}/stream`;
    const source = new EventSource(streamUrl);
    const handleUpdate = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        fetchCampaign(false);
      }, 200);
    };
    const handlePresence = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          presence?: {
            id: string;
            userId?: string;
            username?: string;
            guest?: boolean;
          }[];
        };
        setPresence(data.presence ?? []);
      } catch (error) {
        console.error('Failed to parse presence update', error);
      }
    };
    const handleChatMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as CampaignChatMessage;
        setChatMessages((prev) => [...prev.slice(-maxLogEntries + 1), data]);
      } catch (error) {
        console.error('Failed to parse chat message', error);
      }
    };
    const handleEventLog = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as CampaignLogEntry;
        setEventLog((prev) => [...prev.slice(-maxLogEntries + 1), data]);
      } catch (error) {
        console.error('Failed to parse event log', error);
      }
    };
    source.addEventListener('campaign-updated', handleUpdate);
    source.addEventListener('presence-updated', handlePresence);
    source.addEventListener('chat-message', handleChatMessage);
    source.addEventListener('event-log', handleEventLog);
    return () => {
      source.removeEventListener('campaign-updated', handleUpdate);
      source.removeEventListener('presence-updated', handlePresence);
      source.removeEventListener('chat-message', handleChatMessage);
      source.removeEventListener('event-log', handleEventLog);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      source.close();
    };
  }, [campaignId, fetchCampaign, viewerId, viewerIsGuest]);

  useEffect(() => {
    if (!campaignId) return;
    if (!viewerId) return;
    if (!viewer?.username) return;
    const updateName = async () => {
      try {
        await fetch(`/api/campaigns/${campaignId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ viewerId, username: viewer.username }),
        });
      } catch (error) {
        console.error('Failed to update presence name', error);
      }
    };
    updateName();
  }, [campaignId, viewerId, viewer?.username]);

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
      const newGroup = { ...blankGroup };
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
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCharacterSheetsByUserId(userId);
      setAllCharacters(data);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const source = new EventSource(`/api/sheets/stream?userId=${userId}`);
    const handleUpdate = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(async () => {
        const data = await getCharacterSheetsByUserId(userId);
        setAllCharacters(data);
      }, 200);
    };
    source.addEventListener('sheet-list-updated', handleUpdate);
    return () => {
      source.removeEventListener('sheet-list-updated', handleUpdate);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      source.close();
    };
  }, [userId]);

  return { allCharacters };
};
