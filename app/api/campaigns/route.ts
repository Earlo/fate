import { handleCreate, handleListByUser } from '@/app/api/helpers/handlers';
import { createCampaign, getCampaigns } from '@/schemas/campaign';
import { type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return handleCreate(req, createCampaign, 'Failed to create campaign');
}

export async function GET(req: NextRequest) {
  return handleListByUser(
    req,
    getCampaigns,
    'Failed to get character campaigns',
  );
}
