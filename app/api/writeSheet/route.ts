import { removeKey } from '@/lib/helpers';
import OpenAIClient from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = 'edge';

const openai = new OpenAIClient({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  const { sheet, userContent } = JSON.parse(body.prompt);
  const cleanSheet = removeKey(
    removeKey(
      removeKey(
        removeKey(sheet, [
          '_id',
          '__v',
          'visibleTo',
          'colorPalette',
          'icon',
          'controlledBy',
          'visible',
          'public',
          'visibleIn',
        ]),
        [],
      ),
      [],
    ),
    [],
  );
  const systemContent = `You're helping user to play a fate Core campaign by filling character sheet. Sheet context JSON: ${JSON.stringify(
    cleanSheet,
  )}. The key of the skill indicates the level of bonus character has, the higher the better. Anything under 3 isn't really worth talking about.`;

  // Request the OpenAI API for the response based on the prompt
  console.log('doing', userContent, systemContent);
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    stream: true,
    messages: [
      {
        role: 'system',
        content: systemContent,
      },
      { role: 'user', content: userContent },
    ],
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
