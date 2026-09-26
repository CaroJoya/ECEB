'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  MapPin,
  Star,
  UserPlus,
  Eye,
  Check,
  Compass,
  Users,
  Music,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TrackCard from '@/components/TrackCard';
import AudioPlayer from '@/components/AudioPlayer';
import type { Track, User } from '@/types';
import {
  computeMatchScore,
  classNames,
  getPlanBadgeColor,
  planLabel,
} from '@/lib/helpers';
import { SEED_TRACKS } from '@/lib/seed-data';

type Tab = 'tracks' | 'people';

export default function DiscoverPage() {
  const { currentUser, allUsers, toast } = useApp();
  const [tab, setTab] = useState<Tab>('tracks');
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [playing, setPlaying] = useState<Track | null>(null);

  const tracks: Track[] = SEED_TRACKS;

  const visibleUsers = useMemo(
    () => allUsers.filter((u) => !u.suspended && u.id !== currentUser?.id),
    [allUsers, currentUser]
  );

  const genres = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => set.add(t.genre));
    visibleUsers.forEach((u) => u.genres.forEach((g) => set.add(g)));
    return ['all', ...Array.from(set).sort()];
  }, [tracks, visibleUsers]);

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchQ =
        !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.genre.toLowerCase().includes(query.toLowerCase());
      const matchG = genreFilter === 'all' || t.genre === genreFilter;
      return matchQ && matchG;
    });
  }, [tracks, query, genreFilter]);

  const filteredPeople = useMemo(() => {
    return visibleUsers
      .filter((u) => {
        const matchQ =
          !query ||
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.headline.toLowerCase().includes(query.toLowerCase()) ||
          u.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));
        const matchG = genreFilter === 'all' || u.genres.includes(genreFilter);
        return matchQ && matchG;
      })
      .sort((a, b) => {
        if (!currentUser) return 0;
        return computeMatchScore(currentUser, b) - computeMatchScore(currentUser, a);
      });
  }, [visibleUsers, query, genreFilter, currentUser]);

  function handlePlay(track: Track) {
    setPlaying(track);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
      <div className="flex items-center gap-2 mb-6">
        <Compass className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold">Discover</h1>
      </div>

      <div className="flex gap-1 p-1 bg-base-850 border border-base-700 rounded-lg w-fit mb-6">
        <button
          onClick={() => setTab('tracks')}
          className={classNames(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition',
            tab === 'tracks'
              ? 'bg-accent text-black'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <Music className="w-4 h-4" />
          Tracks
        </button>
        <button
          onClick={() => setTab('people')}
          className={classNames(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition',
            tab === 'people'
              ? 'bg-accent text-black'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <Users className="w-4 h-4" />
          People
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'tracks' ? 'Search tracks...' : 'Search people...'}
            className="w-full bg-base-800 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-base-800 border border-base-700 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white"
          >
            {genres.map((g) => (
              <option key={g} value={g} className="bg-base-800">
                {g === 'all' ? 'All genres' : g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tab === 'tracks' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTracks.map((track) => {
            const owner = allUsers.find((u) => u.id === track.userId);
            return (
              <TrackCard
                key={track.id}
                track={track}
                owner={owner}
                isPlaying={playing?.id === track.id}
                onPlay={handlePlay}
              />
            );
          })}
          {filteredTracks.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-16">
              No tracks match your filters.
            </p>
          )}
        </div>
      ) : (
        <PeopleList
          users={filteredPeople}
          currentUser={currentUser}
          onConnect={() => toast('Connection request sent ✨', 'success')}
        />
      )}

      {playing && (
        <AudioPlayer
          track={playing}
          onClose={() => setPlaying(null)}
          previewOnly={
            currentUser?.plan === 'free' ||
            currentUser?.plan === 'free_listener' ||
            !currentUser
          }
        />
      )}
    </div>
  );
}

function PeopleList({
  users,
  currentUser,
  onConnect,
}: {
  users: User[];
  currentUser: User | null;
  onConnect: () => void;
}) {
  return (
    <div className="space-y-3">
      {users.map((u) => {
        const score = currentUser ? computeMatchScore(currentUser, u) : 0;
        return (
          <div
            key={u.id}
            className="bg-base-850 border border-base-700 rounded-xl p-4 hover:border-base-600 hover:-translate-y-0.5 transition"
          >
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.avatar}
                alt={u.name}
                className="w-12 h-12 rounded-full border border-base-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{u.name}</h3>
                  <Check className="w-3.5 h-3.5 text-info" />
                  <span
                    className={classNames(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
                      getPlanBadgeColor(u.plan)
                    )}
                  >
                    {planLabel(u.plan)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{u.headline}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {u.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning" fill="currentColor" />
                    {u.rating.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {u.skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full bg-base-800 border border-base-700 text-[11px] text-gray-300"
                    >
                      {s}
                    </span>
                  ))}
                  {u.skills.length > 4 && (
                    <span className="text-[11px] text-gray-500">
                      +{u.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/40 text-accent text-xs font-bold">
                  {score}% match
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onConnect}
                    className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Connect
                  </button>
                  <Link
                    href={`/profile/${u.id}`}
                    className="inline-flex items-center gap-1.5 bg-base-800 hover:bg-base-700 text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {users.length === 0 && (
        <p className="text-center text-gray-500 py-16">
          No people match your filters.
        </p>
      )}
    </div>
  );
}