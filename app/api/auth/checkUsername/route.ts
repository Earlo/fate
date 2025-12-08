import { getUserByUsername } from '@/schemas/user';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const parsed = raw ? (JSON.parse(raw) as { username?: string }) : {};
    const username = parsed.username?.trim();
    if (!username) {
      return NextResponse.json(false, { status: 200 });
    }
    const existingUser = await getUserByUsername(username);
    return NextResponse.json(Boolean(existingUser));
  } catch (error) {
    console.error('checkUsername failed', error);
    return NextResponse.json(false, { status: 200 });
  }
}
