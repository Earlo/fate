import { handleUploadFromUrl } from '@/lib/cloudinary';
import { removeKey } from '@/lib/utils';
import { NextResponse, type NextRequest } from 'next/server';
import OpenAIClient from 'openai';
export const runtime = 'edge';

const openai = new OpenAIClient({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  const { sheet } = await req.json();
  const cleanSheet = removeKey(sheet, [
    'id',
    'visibleTo',
    'colorPalette',
    'icon',
    'owner',
    'visible',
    'public',
    'visibleIn',
    'fate',
  ]);
  const systemContent = `You're helping user to play a fate Core campaign by filling character sheet. Write a description of a portrait of this character. Pay attention to aspects, and possible consequences Only focus on visual details. Something that works in a rounded picture frame. No names. Also do note the plausible setting the characterr exists in. Theme. Genre. Artstyle especially! Don't create real people!"`;
  const userContent = `Sheet is currently as follows: ${JSON.stringify(
    cleanSheet,
  )}`;
  console.log('calling gpt3 with', systemContent, userContent);
  const description = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    messages: [
      {
        role: 'system',
        content: systemContent,
      },
      { role: 'user', content: userContent },
    ],
  });
  const text = description.choices[0].message.content;
  console.log('description: ', text);
  if (!text) {
    return NextResponse.json(
      { error: 'No description generated' },
      { status: 500 },
    );
  }
  const response = await openai.images.generate({
    size: '1024x1024',
    quality: 'standard',
    n: 1,
    prompt: `A Fate Core RPG character portrait. ${text}`,
  });
  if (!response.data || !response.data[0]?.url) {
    return NextResponse.json({ error: 'No image generated' }, { status: 500 });
  }

  const imageUrl = response.data[0].url;
  const cloudinaryUrl = await handleUploadFromUrl(imageUrl, 'characters');
  console.log('cloudinary', cloudinaryUrl);
  return NextResponse.json(cloudinaryUrl, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
