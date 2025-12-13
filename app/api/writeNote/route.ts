import { sanitizeForPrompt, streamCompletion } from '@/app/api/helpers/ai';
import { getCampaign } from '@/schemas/campaign';
import { openai } from '@ai-sdk/openai';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { campaignId, prompt } = JSON.parse(body.prompt);
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  const sanitizedCampaign = sanitizeForPrompt(campaign);

  try {
    return await streamCompletion({
      model: openai.chat('gpt-3.5-turbo-0125'),
      systemContent: `You're helping user to manage a fate Core campaign by writing notes. Campaign context JSON: ${JSON.stringify(sanitizedCampaign)}`,
      userContent: prompt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          'Error: ' +
          JSON.stringify(error) +
          ' with context: ' +
          JSON.stringify(sanitizedCampaign),
      },
      { status: 500 },
    );
  }
}
