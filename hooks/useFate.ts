'use client';
import { getCampaignById, updateCampaignAPI } from '@/lib/apiHelpers/campaigns';
import { PopulatedCampaignT } from '@/schemas/campaign';
import { blankFaction } from '@/schemas/consts/blankCampaignSheet';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { CharacterSheetT } from '@/schemas/sheet';
import { useState, useEffect } from 'react';

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

  const updateCampaign = async (updatedCampaign: PopulatedCampaignT) => {
    await updateCampaignAPI(campaignId, updatedCampaign);
    setCampaign(updatedCampaign);
  };

  const addFaction = async () => {
    if (campaign) {
      const newFaction = { ...blankFaction };
      const updatedCampaign = { ...campaign };
      updatedCampaign.factions.push(newFaction);
      await updateCampaign(updatedCampaign);
    } else {
      console.error('Campaign not found');
    }
  };

  const joinLeaveCampaign = async (userId: string) => {
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

  return { campaign, isLoading, updateCampaign, addFaction, joinLeaveCampaign };
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
