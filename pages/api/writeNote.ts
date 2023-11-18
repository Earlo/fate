import { getCampaign } from '@/schemas/campaign';
import { removeKey } from '@/lib/helpers';
import OpenAIClient from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAIClient({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function writeNote(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const { prompt, campaignId } = req.body;
  let campaign = await getCampaign(campaignId as string);
  campaign = removeKey(campaign, [
    '_id',
    '__v',
    'visibleTo',
    'colorPalette',
    'icon',
    'controlledBy',
    'visible',
    'public',
    'visibleIn',
  ]);
  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(200)
      .json(
        'No OpenAI API key, would had called with following context: ' +
          JSON.stringify(campaign),
      );
  }
  try {
    const params: OpenAIClient.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'system',
          content: `You're helping user to manage a fate Core campaign by writing notes. Campaign context JSON: ${JSON.stringify(
            campaign,
          )}`,
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-3.5-turbo-1106',
      stream: true,
    };
    const chatCompletion = await openai.chat.completions.create(params);
    //return res.status(200).json(chatCompletion.choices[0].message.content);
    const stream = OpenAIStream(chatCompletion);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        'Error' +
          JSON.stringify(error) +
          ' with following context: ' +
          JSON.stringify(campaign),
      );
  }
}
