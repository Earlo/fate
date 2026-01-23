import { NextResponse, type NextRequest } from 'next/server';

type IdParams = Promise<{ id: string }>;

export async function handleCreate<T>(
  req: NextRequest,
  createFn: (data: T) => Promise<T | null>,
  errorMessage: string,
) {
  try {
    const payload: T = await req.json();
    const created = await createFn(payload);
    if (!created) {
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function handleListByUser<T>(
  req: NextRequest,
  getter: (userId: string) => Promise<T[]>,
  errorMessage: string,
) {
  try {
    const userId = new URL(req.url).searchParams.get('id');
    if (!userId) {
      return NextResponse.json(null, { status: 400 });
    }
    const result = await getter(userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `${errorMessage} ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 500 },
    );
  }
}

export async function handleGetById<T>(
  params: IdParams,
  getter: (id: string) => Promise<T>,
  notFoundMessage: string,
) {
  const { id } = await params;
  try {
    const result = await getter(id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `${notFoundMessage} ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 404 },
    );
  }
}
