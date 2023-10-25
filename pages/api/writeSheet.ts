import OpenAIClient from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAIClient({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function writeSheet(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const { prompt, sheet } = req.body;
  const removeKey = (obj: object, keyToRemove: string[]) =>
    JSON.parse(
      JSON.stringify(obj, (key, val) =>
        typeof val === 'undefined' || val === null
          ? undefined
          : keyToRemove.includes(key) ||
            val === '' ||
            (typeof val === 'object' && Object.keys(val).length === 0)
          ? undefined
          : Object.keys(val).length === 1
          ? val[Object.keys(val)[0]]
          : Array.isArray(val)
          ? val.filter((x) => !(x === null || x === false))
          : typeof val === 'string'
          ? val.trim().replace('\n', '')
          : val,
      ),
    );
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
  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(200)
      .json(
        'No OpenAI API key, would had called with following context: ' +
          JSON.stringify(cleanSheet),
      );
  }
  try {
    const systemContent = `You're helping user to play a fate Core campaign by filling character sheet. Sheet context JSON: ${JSON.stringify(
      cleanSheet,
    )}. The key of the skill indicates the level of bonus character has, the higher the better. Anything under 3 isn't really worth talking about.`;

    console.log('doing', prompt, systemContent);
    const params: OpenAIClient.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-3.5-turbo',
    };
    const chatCompletion: OpenAIClient.Chat.ChatCompletion =
      await openai.chat.completions.create(params);
    return res.status(200).json(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        'Error' +
          JSON.stringify(error) +
          ' with following context: ' +
          JSON.stringify(cleanSheet),
      );
  }
}
