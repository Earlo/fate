export type ChatMessage = {
  campaignId: string;
  message: string;
  createdAt: string;
  sender?: { id?: string; name?: string; guest?: boolean };
  kind: 'chat' | 'roll';
  roll?: { dice: number[]; total: number; bonus?: number };
};

export type LogEntry = {
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

export type CampaignEvent = {
  campaignId: string;
  updatedAt?: string;
  presence?: PresenceEntry[];
};

export type CampaignStreamPayload = CampaignEvent | ChatMessage | LogEntry;
