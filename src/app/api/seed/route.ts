import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import {
  SEED_USERS,
  SEED_TRACKS,
  SEED_COLLABORATIONS,
  SEED_ORDERS,
  SEED_REVIEWS,
  SEED_PROMOTIONS,
  SEED_DISPUTES,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_SUBSCRIPTIONS,
} from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  if (!db) {
    return NextResponse.json(
      { ok: false, error: 'Firebase not configured. Check .env.local.' },
      { status: 500 }
    );
  }

  try {
    const usersMap: Record<string, unknown> = {};
    SEED_USERS.forEach((u) => {
      usersMap[u.id] = u;
    });
    await set(ref(db, 'users'), usersMap);

    const tracksMap: Record<string, unknown> = {};
    SEED_TRACKS.forEach((t) => {
      tracksMap[t.id] = t;
    });
    await set(ref(db, 'tracks'), tracksMap);

    const collabsMap: Record<string, unknown> = {};
    SEED_COLLABORATIONS.forEach((c) => {
      collabsMap[c.id] = c;
    });
    await set(ref(db, 'collaborations'), collabsMap);

    const ordersMap: Record<string, unknown> = {};
    SEED_ORDERS.forEach((o) => {
      ordersMap[o.id] = o;
    });
    await set(ref(db, 'orders'), ordersMap);

    const reviewsMap: Record<string, unknown> = {};
    SEED_REVIEWS.forEach((r) => {
      reviewsMap[r.id] = r;
    });
    await set(ref(db, 'reviews'), reviewsMap);

    const promosMap: Record<string, unknown> = {};
    SEED_PROMOTIONS.forEach((p) => {
      promosMap[p.id] = p;
    });
    await set(ref(db, 'promotions'), promosMap);

    const disputesMap: Record<string, unknown> = {};
    SEED_DISPUTES.forEach((d) => {
      disputesMap[d.id] = d;
    });
    await set(ref(db, 'disputes'), disputesMap);

    const convosMap: Record<string, unknown> = {};
    SEED_CONVERSATIONS.forEach((c) => {
      convosMap[c.id] = c;
    });
    await set(ref(db, 'conversations'), convosMap);

    for (const convoId of Object.keys(SEED_MESSAGES)) {
      await set(ref(db, `messages/${convoId}`), SEED_MESSAGES[convoId]);
    }

    await set(ref(db, 'notifications'), SEED_NOTIFICATIONS);

    await set(ref(db, 'subscriptions'), SEED_SUBSCRIPTIONS);

    return NextResponse.json({
      ok: true,
      message: 'Seed complete.',
      counts: {
        users: SEED_USERS.length,
        tracks: SEED_TRACKS.length,
        collaborations: SEED_COLLABORATIONS.length,
        orders: SEED_ORDERS.length,
        reviews: SEED_REVIEWS.length,
        promotions: SEED_PROMOTIONS.length,
        disputes: SEED_DISPUTES.length,
        conversations: SEED_CONVERSATIONS.length,
      },
    });
  } catch (err) {
    console.error('[seed] error', err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message || 'Seed failed' },
      { status: 500 }
    );
  }
}