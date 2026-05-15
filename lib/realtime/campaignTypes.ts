export type Roll = { dice: number[]; total: number; bonus?: number };

export type ChatMessage = {
  campaignId: string;
  text: string;
  createdAt: string;
  sender?: { id?: string; name?: string; guest?: boolean };
  kind: 'chat' | 'roll';
  roll?: Roll;
  private?: boolean;
};

export type LogEntry = {
  campaignId: string;
  text: string;
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
