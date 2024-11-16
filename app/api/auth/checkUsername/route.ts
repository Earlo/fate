import connect from '@/lib/mongo';
import { UserModel } from '@/schemas/user';
import { NextResponse, type NextRequest } from 'next/server';
connect();

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    return NextResponse.json(true);
  }
  return NextResponse.json(false);
}
