'use client';
import { getCampaignById, updateCampaignAPI } from '@/lib/apiHelpers/campaigns';
import { PopulatedCampaignT, PopulatedGroup } from '@/schemas/campaign';
import { blankGroup } from '@/schemas/consts/blankCampaignSheet';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { CharacterSheetT } from '@/schemas/sheet';
import { useState, useEffect, useCallback } from 'react';

export const useCampaign = (campaignId: string) => {
  const [campaign, setCampaign] = useState<PopulatedCampaignT>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchCampaign = async () => {
      if (campaignId) {
        setIsLoading(true);
        try {
          const data = await getCampaignById(campaignId);
          setCampaign(data);
        } catch (error) {
          console.error('Could not fetch campaign:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCampaign();
  }, [campaignId]);

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
    updatedGroup: PopulatedGroup,
  ) => {
    if (campaign) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.groups[groupIndex] = updatedGroup;
      updateCampaign(updatedCampaign);
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCharacterSheetsByUserId(userId);
      setAllCharacters(data);
    };
    fetchData();
  }, [userId]);

  return { allCharacters };
};
