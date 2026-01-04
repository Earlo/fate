import { uploadFromUrl } from '@/lib/storage/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { url, path } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const upload = await uploadFromUrl(url, path || undefined);
    return NextResponse.json(upload);
  } catch (error) {
    console.error('Upload from URL to storage failed', error);
    return NextResponse.json(
      { error: 'Failed to upload image to storage' },
      { status: 500 },
    );
  }
}
