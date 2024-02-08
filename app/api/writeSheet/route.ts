import { removeKey } from '@/lib/helpers';
import OpenAIClient from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
export const runtime = 'edge';

const openai = new OpenAIClient({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  const body = await req.json();
  const { sheet, userContent } = JSON.parse(body.prompt);
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
  const systemContent = `You're helping user to play a fate Core campaign by filling character sheet. Sheet context JSON: ${JSON.stringify(
    cleanSheet,
  )}. The key of the skill indicates the level of bonus character has, the higher the better. Anything under 3 isn't really worth talking about.`;
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    stream: true,
    messages: [
      {
        role: 'system',
        content: systemContent,
      },
      { role: 'user', content: userContent },
    ],
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
