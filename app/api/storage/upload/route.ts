import { uploadFile } from '@/lib/storage/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const path = formData.get('path')?.toString();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  try {
    const upload = await uploadFile(file, path || undefined);
    return NextResponse.json(upload);
  } catch (error) {
    console.error('Upload to storage failed', error);
    return NextResponse.json(
      { error: 'Failed to upload image to storage' },
      { status: 500 },
    );
  }
}
