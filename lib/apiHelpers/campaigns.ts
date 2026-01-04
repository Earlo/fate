import { CampaignT, PopulatedCampaignT } from '@/schemas/campaign';
import { fetchJson } from './base';

export const getCampaignsByUserId = async (
  id: string,
): Promise<CampaignT[]> => {
  return fetchJson<CampaignT[]>(`/api/campaigns?id=${id}`);
};

export const getCampaignById = async (
  id: string,
): Promise<PopulatedCampaignT> => {
  const response = await fetchJson<PopulatedCampaignT | { error: string }>(
    `/api/campaigns/${id}`,
  );
  if ('error' in response) {
    throw new Error(response.error);
  }
  return response;
};

export const updateCampaignAPI = async (
  campaignId: string,
  updatedCampaign: PopulatedCampaignT | Partial<CampaignT>,
): Promise<CampaignT> => {
  return fetchJson<CampaignT>(`/api/campaigns/${campaignId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCampaign),
  });
};

export const createCampaignAPI = async (
  campaign: Partial<CampaignT>,
): Promise<CampaignT> => {
  return fetchJson<CampaignT>(`/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
};
