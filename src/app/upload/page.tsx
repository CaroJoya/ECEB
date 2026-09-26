'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload as UploadIcon,
  Music,
  Loader2,
  Lock,
  IndianRupee,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LICENSE_TYPES } from '@/lib/config';
import { ref as dbRef, push, set } from 'firebase/database';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { LicenseKey, Track } from '@/types';
import { classNames, canUpload } from '@/lib/helpers';

export default function UploadPage() {
  const router = useRouter();
  const { currentUser, showUpgradeModal, toast, showPaymentModal } = useApp();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Lo-fi');
  const [bpm, setBpm] = useState(120);
  const [price, setPrice] = useState(0);
  const [license, setLicense] = useState<LicenseKey>('open_collab');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please sign in to upload tracks.</p>
      </div>
    );
  }

  const uploadLimit = canUpload(currentUser.plan);
  if (uploadLimit === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Uploads not available</h1>
        <p className="text-gray-400 mb-4">
          Your plan ({currentUser.plan}) doesn&apos;t include uploads.
        </p>
        <button
          onClick={() => showPaymentModal('pro')}
          className="bg-accent hover:bg-accent-light text-black font-semibold px-4 py-2 rounded-lg transition"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim()) {
      toast('Title is required', 'error');
      return;
    }
    if (!file) {
      toast('Pick an audio file', 'error');
      return;
    }

    setUploading(true);
    let url = `https://picsum.photos/seed/${encodeURIComponent(title)}/800/800`;

    try {
      if (storage) {
        const path = `tracks/${currentUser.id}/${Date.now()}-${file.name}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, file);
        url = await getDownloadURL(sRef);
      }
    } catch (err) {
      console.warn('[upload] storage fallback', err);
    }

    const trackId = `track_${Date.now()}`;
    const newTrack: Track = {
      id: trackId,
      userId: currentUser.id,
      title: title.trim(),
      url,
      coverUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}-cover/400/400`,
      plays: 0,
      genre,
      bpm,
      license,
      price,
      description: description.trim(),
      createdAt: Date.now(),
    };

    try {
      if (db) {
        await set(dbRef(db, `tracks/${trackId}`), newTrack);
      }
      toast('Track uploaded 🎉', 'success');
      setUploading(false);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      toast('Upload failed', 'error');
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-6">
        <UploadIcon className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold">Upload Track</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-base-850 border border-base-700 rounded-xl p-5 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midnight Rain"
            className="w-full bg-base-800 border border-base-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-accent outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-base-800 border border-base-700 rounded-lg px-3 py-2 text-white focus:border-accent outline-none"
            >
              {['Lo-fi', 'Pop', 'Hip-hop', 'Rock', 'Indie', 'Electronic', 'R&B', 'Ambient'].map(
                (g) => (
                  <option key={g}>{g}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">BPM</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full bg-base-800 border border-base-700 rounded-lg px-3 py-2 text-white focus:border-accent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">License</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(LICENSE_TYPES).map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setLicense(l.key as LicenseKey)}
                className={classNames(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition text-left',
                  license === l.key
                    ? 'bg-accent/10 border-accent text-white'
                    : 'bg-base-800 border-base-700 hover:border-base-600'
                )}
              >
                <span>{l.icon}</span>
                <span className="truncate">{l.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Price (₹, 0 = free)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-base-800 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-white focus:border-accent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell collaborators about this track..."
            className="w-full bg-base-800 border border-base-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-accent outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Audio file</label>
          <label className="flex items-center justify-center gap-3 bg-base-800 hover:bg-base-750 border border-dashed border-base-600 rounded-lg py-6 cursor-pointer transition">
            <Music className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-400">
              {file ? file.name : 'Click to choose an audio file'}
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-black font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="w-4 h-4" /> Upload Track
            </>
          )}
        </button>
      </form>
    </div>
  );
}