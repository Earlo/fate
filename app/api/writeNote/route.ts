import { removeKey } from '@/lib/helpers';
import { getCampaign } from '@/schemas/campaign';
import OpenAIClient from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';
//Shouldn't use edge on endpoints that use DB
//export const runtime = 'edge';

const openai = new OpenAIClient({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  const body = await req.json();
  const { campaignId, prompt } = JSON.parse(body.prompt);
  let campaign = await getCampaign(campaignId as string);
  campaign = removeKey(campaign, [
    '_id',
    '__v',
    'visibleTo',
    'colorPalette',
    'icon',
    'owner',
    'visible',
    'public',
    'visibleIn',
  ]);
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          'No OpenAI API key, would had called with following context: ' +
          JSON.stringify(campaign),
      },
      { status: 500 },
    );
  }
  try {
    const params: OpenAIClient.Chat.ChatCompletionCreateParams = {
      model: 'gpt-3.5-turbo-0125',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You're helping user to manage a fate Core campaign by writing notes. Campaign context JSON: ${JSON.stringify(
            campaign,
          )}`,
        },
        { role: 'user', content: prompt },
      ],
    };
    const chatCompletion = await openai.chat.completions.create(params);
    const stream = OpenAIStream(chatCompletion);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          'Error' +
          JSON.stringify(error) +
          ' with following context: ' +
          JSON.stringify(campaign),
      },
      { status: 500 },
    );
  }
}
