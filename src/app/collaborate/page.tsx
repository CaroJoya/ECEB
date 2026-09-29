'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { onValue, ref } from 'firebase/database';
import {
  Users,
  Search,
  UserPlus,
  Star,
  MapPin,
  Check,
  Sparkles,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import {
  classNames,
  computeMatchScore,
  getPlanBadgeColor,
  planLabel,
  sendConnectionRequest,
} from '@/lib/helpers';

type ConnState = 'none' | 'pending' | 'connected';

export default function CollaboratePage() {
  const { currentUser, allUsers, toast } = useApp();
  const [query, setQuery] = useState('');
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [requests, setRequests] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  // Subscribe to my outgoing connection requests + connections
  useEffect(() => {
    if (!db || !currentUser) return;
    const reqRef = ref(db, 'connectionRequests');
    const conRef = ref(db, `connections/${currentUser.id}`);

    const reqUnsub = onValue(reqRef, (snap) => {
      const val = snap.val();
      const map: Record<string, string> = {};
      if (val && typeof val === 'object') {
        Object.values(val).forEach((r: any) => {
          if (r?.from === currentUser.id && r?.status === 'pending') {
            map[r.to] = r.status;
          }
        });
      }
      setRequests(map);
    });

    const conUnsub = onValue(conRef, (snap) => {
      const val = snap.val();
      const map: Record<string, boolean> = {};
      if (val && typeof val === 'object') {
        Object.keys(val).forEach((uid) => {
          map[uid] = true;
        });
      }
      setConnections(map);
    });

    return () => {
      reqUnsub();
      conUnsub();
    };
  }, [currentUser]);

  const candidates = useMemo(() => {
    if (!currentUser) return [];
    return allUsers
      .filter(
        (u) =>
          u.id !== currentUser.id &&
          !u.suspended &&
          (u.plan === 'free' ||
            u.plan === 'pro' ||
            u.plan === 'studio' ||
            u.plan === 'label')
      )
      .map((u) => ({ user: u, score: computeMatchScore(currentUser, u) }))
      .sort((a, b) => b.score - a.score);
  }, [allUsers, currentUser]);

  const filtered = useMemo(
    () =>
      candidates.filter(
        ({ user }) =>
          !query ||
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.skills.some((s) =>
            s.toLowerCase().includes(query.toLowerCase())
          ) ||
          user.genres.some((g) =>
            g.toLowerCase().includes(query.toLowerCase())
          )
      ),
    [candidates, query]
  );

  function getState(userId: string): ConnState {
    if (connections[userId]) return 'connected';
    if (requests[userId]) return 'pending';
    return 'none';
  }

  async function handleRequest(user: { id: string; name: string }) {
    if (!currentUser || busyId) return;
    setBusyId(user.id);
    try {
      await sendConnectionRequest(
        db,
        currentUser.id,
        user.id,
        currentUser.name
      );
      toast(`Request sent to ${user.name} ✨`, 'success');
    } catch (e) {
      console.warn(e);
      toast('Could not send request', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Users className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please sign in to find collaborators.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold">Find Collaborators</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Matched by genre, skill, rating, and activity.
      </p>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, skill, or genre..."
          className="w-full bg-base-800 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(({ user, score }) => {
          const state = getState(user.id);
          return (
            <div
              key={user.id}
              className="bg-base-850 border border-base-700 rounded-xl p-4 hover:border-base-600 transition"
            >
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border border-base-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{user.name}</h3>
                    <Check className="w-3.5 h-3.5 text-info" />
                    <span
                      className={classNames(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
                        getPlanBadgeColor(user.plan)
                      )}
                    >
                      {planLabel(user.plan)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {user.headline}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {user.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star
                        className="w-3 h-3 text-warning"
                        fill="currentColor"
                      />
                      {user.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {user.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full bg-base-800 border border-base-700 text-[11px] text-gray-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/40 text-accent text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    {score}% match
                  </div>

                  {state === 'connected' && (
                    <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent/40 font-semibold text-xs px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> Connected
                    </span>
                  )}

                  {state === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning border border-warning/40 font-semibold text-xs px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5" /> Requested
                    </span>
                  )}

                  {state === 'none' && (
                    <button
                      onClick={() => handleRequest(user)}
                      disabled={busyId === user.id}
                      className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {busyId === user.id ? 'Sending...' : 'Request'}
                    </button>
                  )}

                  <Link
                    href={`/profile/${user.id}`}
                    className="text-[11px] text-gray-400 hover:text-accent transition"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-16">
            No collaborators match your search.
          </p>
        )}
      </div>
    </div>
  );
}