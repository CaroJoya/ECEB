'use client';

import { useEffect, useState, useMemo } from 'react';
import { onValue, ref, update } from 'firebase/database';
import {
  Shield,
  Users,
  Music,
  AlertCircle,
  Ban,
  Check,
  Trash2,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import type { User, Track, Dispute } from '@/types';
import { classNames, timeAgo, planLabel, truncate } from '@/lib/helpers';
import {
  SEED_USERS,
  SEED_TRACKS,
  SEED_DISPUTES,
} from '@/lib/seed-data';

type Tab = 'users' | 'tracks' | 'disputes';

export default function AdminPage() {
  const { currentUser, toast } = useApp();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [tracks, setTracks] = useState<Track[]>(SEED_TRACKS);
  const [disputes, setDisputes] = useState<Dispute[]>(SEED_DISPUTES);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!db) return;
    const uUnsub = onValue(ref(db, 'users'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') setUsers(Object.values(val) as User[]);
    });
    const tUnsub = onValue(ref(db, 'tracks'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') setTracks(Object.values(val) as Track[]);
    });
    const dUnsub = onValue(ref(db, 'disputes'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') setDisputes(Object.values(val) as Dispute[]);
    });
    return () => {
      uUnsub();
      tUnsub();
      dUnsub();
    };
  }, []);

  if (currentUser?.plan !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Shield className="w-10 h-10 text-danger mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Admin access required</h1>
        <p className="text-gray-400">
          Sign in as Admin User (user_10) to view this page.
        </p>
      </div>
    );
  }

  async function toggleSuspend(user: User) {
    try {
      if (db) {
        await update(ref(db, `users/${user.id}`), {
          suspended: !user.suspended,
        });
      }
      toast(
        user.suspended ? `${user.name} reinstated` : `${user.name} suspended`,
        'success'
      );
    } catch (e) {
      console.warn(e);
      toast('Action failed', 'error');
    }
  }

  async function removeTrack(track: Track) {
    try {
      if (db) {
        await update(ref(db, `tracks/${track.id}`), {
          promoted: false,
          promoType: null,
        });
      }
      toast('Track removed from promotion', 'success');
    } catch (e) {
      console.warn(e);
    }
  }

  async function resolveDispute(d: Dispute) {
    try {
      if (db) {
        await update(ref(db, `disputes/${d.id}`), { status: 'resolved' });
      }
      toast('Dispute marked resolved', 'success');
    } catch (e) {
      console.warn(e);
    }
  }

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          !query ||
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
      ),
    [users, query]
  );

  const filteredTracks = useMemo(
    () =>
      tracks.filter(
        (t) => !query || t.title.toLowerCase().includes(query.toLowerCase())
      ),
    [tracks, query]
  );

  const filteredDisputes = useMemo(
    () =>
      disputes.filter(
        (d) =>
          !query ||
          d.evidence.toLowerCase().includes(query.toLowerCase()) ||
          d.id.toLowerCase().includes(query.toLowerCase())
      ),
    [disputes, query]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-danger" />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-base-850 border border-base-700 rounded-lg w-fit mb-6">
        {(
          [
            { key: 'users', label: 'Users', icon: Users },
            { key: 'tracks', label: 'Tracks', icon: Music },
            { key: 'disputes', label: 'Disputes', icon: AlertCircle },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={classNames(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition',
              tab === key
                ? 'bg-accent text-black'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full bg-base-800 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
        />
      </div>

      {tab === 'users' && (
        <div className="bg-base-850 border border-base-700 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 border-b border-base-700 text-[11px] uppercase tracking-wider text-gray-500">
            <div className="col-span-5">User</div>
            <div className="col-span-2 hidden sm:block">Plan</div>
            <div className="col-span-3 hidden md:block">Joined</div>
            <div className="col-span-7 sm:col-span-5 md:col-span-2 text-right">
              Actions
            </div>
          </div>
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0 border-base-800"
            >
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-8 h-8 rounded-full border border-base-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                </div>
              </div>
              <div className="col-span-2 hidden sm:block text-xs text-gray-400">
                {planLabel(u.plan)}
              </div>
              <div className="col-span-3 hidden md:block text-xs text-gray-500">
                {timeAgo(u.createdAt)}
              </div>
              <div className="col-span-7 sm:col-span-5 md:col-span-2 flex justify-end">
                <button
                  onClick={() => toggleSuspend(u)}
                  className={classNames(
                    'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition',
                    u.suspended
                      ? 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
                      : 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20'
                  )}
                >
                  {u.suspended ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Reinstate
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" /> Suspend
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tracks' && (
        <div className="bg-base-850 border border-base-700 rounded-xl overflow-hidden">
          {filteredTracks.slice(0, 50).map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 border-base-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.coverUrl}
                alt={t.title}
                className="w-10 h-10 rounded-lg border border-base-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {t.genre} • {t.plays.toLocaleString()} plays •{' '}
                  {truncate(t.description, 40)}
                </p>
              </div>
              {t.promoted && (
                <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-semibold uppercase">
                  {t.promoType}
                </span>
              )}
              <button
                onClick={() => removeTrack(t)}
                className="p-1.5 rounded-lg hover:bg-base-800 text-danger transition"
                aria-label="Remove promotion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'disputes' && (
        <div className="space-y-3">
          {filteredDisputes.map((d) => (
            <div
              key={d.id}
              className="bg-base-850 border border-base-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className={classNames(
                      'w-4 h-4',
                      d.status === 'resolved'
                        ? 'text-accent'
                        : d.status === 'mediating'
                        ? 'text-warning'
                        : 'text-danger'
                    )}
                  />
                  <span className="text-sm font-semibold">{d.id}</span>
                  <span
                    className={classNames(
                      'px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold border',
                      d.status === 'resolved'
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : d.status === 'mediating'
                        ? 'bg-warning/10 text-warning border-warning/30'
                        : 'bg-danger/10 text-danger border-danger/30'
                    )}
                  >
                    {d.status}
                  </span>
                </div>
                {d.status !== 'resolved' && (
                  <button
                    onClick={() => resolveDispute(d)}
                    className="text-xs bg-accent hover:bg-accent-light text-black font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300">{d.evidence}</p>
              <p className="text-[11px] text-gray-500 mt-2">
                Filed {timeAgo(d.createdAt)} • Deadline {timeAgo(d.deadline)}
              </p>
            </div>
          ))}
          {filteredDisputes.length === 0 && (
            <p className="text-center text-gray-500 py-12">No disputes.</p>
          )}
        </div>
      )}
    </div>
  );
}