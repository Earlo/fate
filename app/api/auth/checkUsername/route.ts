import { UserModel } from '@/schemas/user';
import connect from '@/lib/mongo';
import { NextResponse } from 'next/server';
connect();

export async function POST(req: Request) {
  const { username } = await req.json();
  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    return NextResponse.json(true);
  }
  return NextResponse.json(false);
}
