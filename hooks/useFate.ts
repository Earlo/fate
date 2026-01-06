'use client';
import { getCampaignById, updateCampaignAPI } from '@/lib/apiHelpers/campaigns';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { PopulatedCampaignT, PopulatedGroup } from '@/schemas/campaign';
import { blankGroup } from '@/schemas/consts/blankCampaignSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useCampaign = (campaignId: string) => {
  const [campaign, setCampaign] = useState<PopulatedCampaignT>();
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const source = new EventSource(`/api/campaigns/${campaignId}/stream`);
    const handleUpdate = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        fetchCampaign(false);
      }, 200);
    };
    source.addEventListener('campaign-updated', handleUpdate);
    return () => {
      source.removeEventListener('campaign-updated', handleUpdate);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      source.close();
    };
  }, [campaignId, fetchCampaign]);

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
