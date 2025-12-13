import { removeKey } from '@/lib/utils';
import { streamText, type LanguageModel } from 'ai';

const PRIVATE_KEYS = [
  '_id',
  '__v',
  'visibleTo',
  'colorPalette',
  'icon',
  'owner',
  'visible',
  'public',
  'visibleIn',
] as const;

export function sanitizeForPrompt<T>(data: T) {
  return removeKey(data as object, [...PRIVATE_KEYS]);
}

export async function streamCompletion({
  model,
  systemContent,
  userContent,
}: {
  model: LanguageModel;
  systemContent: string;
  userContent: string;
}) {
  const result = await streamText({
    model,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ],
  });

  return result.toTextStreamResponse();
}
