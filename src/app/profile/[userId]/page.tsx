'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { onValue, ref } from 'firebase/database';
import {
  MapPin,
  Star,
  Check,
  UserPlus,
  MessageCircle,
  Music,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import TrackCard from '@/components/TrackCard';
import type { User, Track, Review } from '@/types';
import {
  classNames,
  computeMatchScore,
  getPlanBadgeColor,
  planLabel,
  timeAgo,
} from '@/lib/helpers';
import { SEED_USERS, SEED_TRACKS, SEED_REVIEWS } from '@/lib/seed-data';

interface Props {
  params: { userId: string };
}

export default function ProfilePage({ params }: Props) {
  const { userId } = params;
  const { allUsers, currentUser, toast } = useApp();
  const [tracks, setTracks] = useState<Track[]>(SEED_TRACKS);
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);

  useEffect(() => {
    if (!db) return;
    const tUnsub = onValue(ref(db, 'tracks'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') setTracks(Object.values(val) as Track[]);
    });
    const rUnsub = onValue(ref(db, 'reviews'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') setReviews(Object.values(val) as Review[]);
    });
    return () => {
      tUnsub();
      rUnsub();
    };
  }, []);

  const user: User | undefined = useMemo(
    () => allUsers.find((u) => u.id === userId) || SEED_USERS.find((u) => u.id === userId),
    [allUsers, userId]
  );

  const userTracks = useMemo(
    () => tracks.filter((t) => t.userId === userId),
    [tracks, userId]
  );

  const userReviews = useMemo(
    () => reviews.filter((r) => r.revieweeId === userId),
    [reviews, userId]
  );

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">User not found.</p>
      </div>
    );
  }

  if (user.suspended) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-danger">This account has been suspended.</p>
      </div>
    );
  }

  const isMe = currentUser?.id === user.id;
  const matchScore =
    currentUser && !isMe ? computeMatchScore(currentUser, user) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header card */}
      <div className="bg-base-850 border border-base-700 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full border-2 border-base-700 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <Check className="w-4 h-4 text-info" />
              <span
                className={classNames(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
                  getPlanBadgeColor(user.plan)
                )}
              >
                {planLabel(user.plan)}
              </span>
              {matchScore !== null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 border border-accent/40 text-accent text-[11px] font-bold">
                  {matchScore}% match
                </span>
              )}
            </div>

            <p className="text-gray-300">{user.headline}</p>
            <p className="text-sm text-gray-400 mt-2">{user.bio}</p>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {user.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning" fill="currentColor" />
                {user.rating.toFixed(1)} ({userReviews.length} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Music className="w-3.5 h-3.5" /> {userTracks.length} tracks
              </span>
            </div>

            {!isMe && (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => toast('Connection request sent ✨', 'success')}
                  className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
                >
                  <UserPlus className="w-4 h-4" /> Connect
                </button>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1.5 bg-base-800 hover:bg-base-700 text-sm px-4 py-2 rounded-lg transition"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Skills + Genres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-base-700">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full bg-base-800 border border-base-700 text-[11px] text-gray-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
              Genres
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-[11px]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-4 h-4 text-accent" />
          <h2 className="font-semibold">Tracks</h2>
        </div>
        {userTracks.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center bg-base-850 border border-base-700 rounded-xl">
            No tracks yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {userTracks.map((t) => (
              <TrackCard key={t.id} track={t} owner={user} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h2 className="font-semibold">Reviews</h2>
        </div>
        {userReviews.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center bg-base-850 border border-base-700 rounded-xl">
            No reviews yet.
          </p>
        ) : (
          <div className="space-y-2">
            {userReviews.map((r) => {
              const reviewer = allUsers.find((u) => u.id === r.reviewerId);
              return (
                <div
                  key={r.id}
                  className="bg-base-850 border border-base-700 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reviewer?.avatar || 'https://ui-avatars.com/api/?name=U'}
                      alt={reviewer?.name || 'User'}
                      className="w-8 h-8 rounded-full border border-base-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {reviewer?.name || 'Anonymous'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {timeAgo(r.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={classNames(
                            'w-3.5 h-3.5',
                            i < r.rating ? 'text-warning' : 'text-base-600'
                          )}
                          fill={i < r.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{r.comment}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}