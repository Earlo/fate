import { removeKey } from '@/lib/utils';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

const openai = createOpenAI({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sheet, userContent } = body.prompt; // Adjusted to avoid double JSON parsing.

  const cleanSheet = removeKey(sheet, [
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

  const systemContent = `You're helping the user to play a Fate Core campaign by filling a character sheet. Sheet is currently as follows: ${JSON.stringify(
    cleanSheet,
  )}. The key of the skill indicates the level of bonus character has, the higher the better. Anything under 3 isn't really worth talking about.`;

  // Create the model instance with OpenAI SDK
  const model = openai.chat('gpt-4-turbo');

  // Use `streamText` for streaming completion
  const stream = await streamText({
    model,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ],
  });

  // Return a text stream response for streamed data
  return stream.toTextStreamResponse();
}
