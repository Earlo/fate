import { NextResponse } from 'next/server';

export async function GET() {
  const mode =
    process.env.P2P_CONNECTION_TYPE?.toUpperCase() === 'ABLY'
      ? 'ABLY'
      : 'SOCKET';
  return NextResponse.json(
    { mode },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
