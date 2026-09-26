import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = (body?.title as string) || 'Untitled';
    const userId = (body?.userId as string) || 'user_01';

    const trackId = `track_${Date.now()}`;

    return NextResponse.json({
      ok: true,
      track: {
        id: trackId,
        userId,
        title,
        url: `https://picsum.photos/seed/${encodeURIComponent(title)}/800/800`,
        coverUrl: `https://picsum.photos/seed/${encodeURIComponent(
          title
        )}-cover/400/400`,
        plays: 0,
        genre: body?.genre || 'Lo-fi',
        bpm: body?.bpm || 120,
        license: body?.license || 'open_collab',
        price: body?.price || 0,
        description: body?.description || '',
        createdAt: Date.now(),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}