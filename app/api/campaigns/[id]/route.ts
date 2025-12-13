import { handleGetById, handleUpdateById } from '@/app/api/helpers/handlers';
import { getCampaign, updateCampaign } from '@/schemas/campaign';
import { type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleGetById(params, getCampaign, 'Campaign not found');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleUpdateById(
    req,
    params,
    updateCampaign,
    'Failed to update campaign',
  );
}
