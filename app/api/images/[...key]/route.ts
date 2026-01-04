import {
  getObjectFromGarage,
  resolveStorageProvider,
} from '@/lib/storage/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await params;
  const key = keyParts.join('/');

  try {
    if (resolveStorageProvider() !== 'garage') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const object = await getObjectFromGarage(key);
    return new NextResponse(object.stream, {
      status: 200,
      headers: {
        'Content-Type': object.contentType,
        ...(object.contentLength
          ? { 'Content-Length': object.contentLength.toString() }
          : {}),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    console.error(`Failed to fetch ${key} from Garage`, error);
    if (
      typeof error === 'object' &&
      error !== null &&
      '$metadata' in error &&
      (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === 404
    ) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Storage fetch failed' },
      { status: 500 },
    );
  }
}
