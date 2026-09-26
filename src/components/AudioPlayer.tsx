'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from 'lucide-react';
import type { Track } from '@/types';
import { classNames } from '@/lib/helpers';

interface Props {
  track: Track | null;
  onClose: () => void;
  previewOnly?: boolean;
}

export default function AudioPlayer({ track, onClose, previewOnly }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    if (!audioRef.current || !track) return;
    const audio = audioRef.current;
    audio.load();
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
    return () => {
      audio.pause();
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!track) return null;

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function onTimeUpdate() {
    if (!audioRef.current) return;
    const a = audioRef.current;
    if (previewOnly && a.currentTime >= 30) {
      a.pause();
      setPlaying(false);
      return;
    }
    setProgress(a.currentTime);
  }

  function onLoaded() {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setProgress(val);
    }
  }

  function fmt(s: number) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-base-850/95 backdrop-blur border-t border-base-700 animate-slide-up">
      <audio
        ref={audioRef}
        src={track.url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoaded}
        onEnded={() => setPlaying(false)}
      />

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-12 h-12 rounded-lg border border-base-700 hidden sm:block"
        />

        <div className="min-w-0 w-32 sm:w-48">
          <p className="text-sm font-semibold truncate">{track.title}</p>
          <p className="text-xs text-gray-400 truncate">{track.genre}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded-lg hover:bg-base-800 transition"
            aria-label="Previous"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full bg-accent hover:bg-accent-light text-black flex items-center justify-center transition"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <Pause className="w-5 h-5" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            )}
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-base-800 transition"
            aria-label="Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 hidden md:flex items-center gap-2">
          <span className="text-xs text-gray-500 w-10 text-right">
            {fmt(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={seek}
            className="flex-1 accent-[#1DB954] h-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {previewOnly ? '0:30' : fmt(duration)}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-[#1DB954] h-1"
          />
        </div>

        {previewOnly && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/40 text-[10px] font-semibold">
            30s Preview
          </span>
        )}

        <button
          onClick={onClose}
          className={classNames('p-1.5 rounded-lg hover:bg-base-800 transition')}
          aria-label="Close player"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}