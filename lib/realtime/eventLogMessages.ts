export const nameChangedEvent = (
  campaignId: string,
  previousLabel: string,
  nextLabel: string,
) => ({
  campaignId,
  kind: 'system' as const,
  message: `${previousLabel} changed name to ${nextLabel}`,
  createdAt: new Date().toISOString(),
});

export const joinEvent = (campaignId: string, label: string) => ({
  campaignId,
  kind: 'join' as const,
  message: `${label} joined`,
  createdAt: new Date().toISOString(),
});

export const leaveEvent = (campaignId: string, label: string) => ({
  campaignId,
  kind: 'leave' as const,
  message: `${label} left`,
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
  message: `${label} rolled ${total}`,
  createdAt,
});
