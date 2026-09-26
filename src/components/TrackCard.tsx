'use client';

import { Play, Pause, Lock, TrendingUp, Music } from 'lucide-react';
import type { Track, User } from '@/types';
import {
  licenseIcon,
  licenseLabel,
  formatPrice,
  classNames,
  timeAgo,
} from '@/lib/helpers';

interface Props {
  track: Track;
  owner?: User;
  isPlaying?: boolean;
  onPlay?: (track: Track) => void;
  onOpen?: (track: Track) => void;
  locked?: boolean;
  onLockedClick?: () => void;
}

export default function TrackCard({
  track,
  owner,
  isPlaying,
  onPlay,
  onOpen,
  locked,
  onLockedClick,
}: Props) {
  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (locked) {
      onLockedClick?.();
      return;
    }
    onPlay?.(track);
  }

  return (
    <div
      onClick={() => onOpen?.(track)}
      className="group bg-base-850 border border-base-700 rounded-xl overflow-hidden hover:border-base-600 hover:-translate-y-0.5 transition cursor-pointer"
    >
      <div className="relative aspect-square bg-base-800 overflow-hidden">
        {track.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-10 h-10 text-base-600" />
          </div>
        )}

        {track.promoted && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-black text-[10px] font-bold uppercase">
            <TrendingUp className="w-3 h-3" />
            {track.promoType || 'Featured'}
          </div>
        )}

        {locked && (
          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur border border-base-600">
            <Lock className="w-3.5 h-3.5 text-warning" />
          </div>
        )}

        <button
          onClick={handlePlay}
          className={classNames(
            'absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition',
            isPlaying
              ? 'bg-accent text-black scale-100'
              : 'bg-accent text-black opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          )}
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">{track.title}</h3>
          {track.price > 0 ? (
            <span className="text-xs font-semibold text-accent flex-shrink-0">
              {formatPrice(track.price)}
            </span>
          ) : (
            <span className="text-[10px] text-gray-500 flex-shrink-0">FREE</span>
          )}
        </div>

        <p className="text-xs text-gray-400 truncate mb-2">
          {owner?.name || 'Unknown Artist'} • {track.genre}
        </p>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span>{licenseIcon(track.license)}</span>
            <span className="truncate max-w-[100px]">
              {licenseLabel(track.license)}
            </span>
          </span>
          <span>{track.plays.toLocaleString()} plays</span>
        </div>

        <p className="text-[10px] text-gray-600 mt-1">{timeAgo(track.createdAt)}</p>
      </div>
    </div>
  );
}