export const nameChangedEvent = (
  campaignId: string,
  previousLabel: string,
  nextLabel: string,
) => ({
  campaignId,
  kind: 'system' as const,
  text: `${previousLabel} changed name to ${nextLabel}`,
  createdAt: new Date().toISOString(),
});

export const joinEvent = (campaignId: string, label: string) => ({
  campaignId,
  kind: 'join' as const,
  text: `${label} joined`,
  createdAt: new Date().toISOString(),
});

export const leaveEvent = (campaignId: string, label: string) => ({
  campaignId,
  kind: 'leave' as const,
  text: `${label} left`,
  createdAt: new Date().toISOString(),
});

export const rollEvent = (
  campaignId: string,
  label: string,
  createdAt: string,
  total: number,
) => ({
  campaignId,
  kind: 'roll' as const,
  text: `${label} rolled ${total}`,
  createdAt,
});
