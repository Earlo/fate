import { authErrorResponse, requireCampaignMember } from '@/lib/apiAuth';
import { publishEventLog } from '@/lib/realtime/campaigns';
import {
  joinEvent,
  leaveEvent,
  nameChangedEvent,
} from '@/lib/realtime/eventLogMessages';
import { NextResponse, type NextRequest } from 'next/server';

const cleanLabel = (value: unknown) =>
  typeof value === 'string' ? value.trim().slice(0, 80) : '';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await requireCampaignMember(id);
    const body = await req.json();
    const label = cleanLabel(body?.label);
    const previousLabel = cleanLabel(body?.previousLabel);
    const nextLabel = cleanLabel(body?.nextLabel);
    const event =
      body?.kind === 'join' && label
        ? joinEvent(id, label)
        : body?.kind === 'leave' && label
          ? leaveEvent(id, label)
          : body?.kind === 'name-change' && previousLabel && nextLabel
            ? nameChangedEvent(id, previousLabel, nextLabel)
            : null;
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid event log request' },
        { status: 400 },
      );
    }
    await publishEventLog(id, event);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return (
      authErrorResponse(error) ??
      NextResponse.json(
        { error: 'Failed to publish event log' },
        { status: 400 },
      )
    );
  }
}
