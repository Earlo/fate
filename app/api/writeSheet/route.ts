import { sanitizeForPrompt, streamCompletion } from '@/app/api/helpers/ai';
import { createOpenAI } from '@ai-sdk/openai';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

const openai = createOpenAI({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sheet, userContent } = body.prompt; // Adjusted to avoid double JSON parsing.

  const cleanSheet = sanitizeForPrompt(sheet);

  const systemContent = `You're helping the user to play a Fate Core campaign by filling a character sheet. Sheet is currently as follows: ${JSON.stringify(
    cleanSheet,
  )}. The key of the skill indicates the level of bonus character has, the higher the better. Anything under 3 isn't really worth talking about.`;

  return streamCompletion({
    model: openai.chat('gpt-4-turbo'),
    systemContent,
    userContent,
  });
}
