import { CampaignT, PopulatedCampaignT } from '@/schemas/campaign';

export const getCampaignsByUserId = async (
  id: string,
): Promise<CampaignT[]> => {
  return await fetch(`/api/campaigns?id=${id}`).then((res) => res.json());
};

export const getCampaignById = async (
  id: string,
): Promise<PopulatedCampaignT> => {
  const response = await fetch(`/api/campaigns/${id}`).then((res) =>
    res.json(),
  );
  if (response.error) {
    throw new Error(response.error);
  }
  return response;
};

export const updateCampaignAPI = async (
  campaignId: string,
  updatedCampaign: PopulatedCampaignT | Partial<CampaignT>,
): Promise<CampaignT> => {
  return await fetch(`/api/campaigns/${campaignId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCampaign),
  }).then((res) => res.json());
};

export const createCampaignAPI = async (
  campaign: Partial<CampaignT>,
): Promise<CampaignT> => {
  return await fetch(`/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  }).then((res) => res.json());
};
