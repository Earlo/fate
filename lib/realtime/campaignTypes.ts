export type CampaignChatMessage = {
  campaignId: string;
  message: string;
  createdAt: string;
  sender?: { id?: string; name?: string; guest?: boolean };
  kind: 'chat' | 'roll';
  roll?: { dice: number[]; total: number; bonus?: number };
};

export type CampaignLogEntry = {
  campaignId: string;
  message: string;
  createdAt: string;
  kind: 'join' | 'leave' | 'roll' | 'system';
};

export type PresenceEntry = {
  id: string;
  userId?: string;
  username?: string;
  guest?: boolean;
};
