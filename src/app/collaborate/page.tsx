'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { Users, Lock, Check, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import type { Collaboration, User, Track } from '@/types';
import { classNames, timeAgo } from '@/lib/helpers';
import { SEED_COLLABORATIONS, SEED_USERS, SEED_TRACKS } from '@/lib/seed-data';

export default function CollaboratePage() {
  const { currentUser, allUsers } = useApp();
  const [collabs, setCollabs] = useState<Collaboration[]>(SEED_COLLABORATIONS);
  const [tracks, setTracks] = useState<Track[]>(SEED_TRACKS);

  useEffect(() => {
    if (!db) return;
    const cUnsub = onValue(ref(db, 'collaborations'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') {
        setCollabs(Object.values(val) as Collaboration[]);
      }
    });
    const tUnsub = onValue(ref(db, 'tracks'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') {
        setTracks(Object.values(val) as Track[]);
      }
    });
    return () => {
      cUnsub();
      tUnsub();
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please sign in to view collaborations.</p>
      </div>
    );
  }

  const mine = collabs.filter(
    (c) => c.initiatorId === currentUser.id || c.contributorId === currentUser.id
  );

  function findUser(id: string): User | undefined {
    return allUsers.find((u) => u.id === id) || SEED_USERS.find((u) => u.id === id);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold">Collaborations</h1>
      </div>

      {mine.length === 0 ? (
        <div className="bg-base-850 border border-base-700 rounded-xl py-16 text-center">
          <Users className="w-10 h-10 text-base-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No collaborations yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((c) => {
            const other = findUser(
              c.initiatorId === currentUser.id ? c.contributorId : c.initiatorId
            );
            const track = tracks.find((t) => t.id === c.trackId);
            return (
              <div
                key={c.id}
                className="bg-base-850 border border-base-700 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={other?.avatar || 'https://ui-avatars.com/api/?name=U'}
                    alt={other?.name || 'User'}
                    className="w-10 h-10 rounded-full border border-base-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {other?.name || 'Unknown'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      Role: {c.role} • {track?.title || 'Track'}
                    </p>
                  </div>
                  <span
                    className={classNames(
                      'px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold border',
                      c.status === 'active'
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : c.status === 'pending'
                        ? 'bg-warning/10 text-warning border-warning/30'
                        : c.status === 'completed'
                        ? 'bg-info/10 text-info border-info/30'
                        : 'bg-danger/10 text-danger border-danger/30'
                    )}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  Started {timeAgo(c.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}