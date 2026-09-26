'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { SEED_USERS } from '@/lib/seed-data';
import { simulateSignIn } from '@/lib/fake-auth';
import type { User } from '@/types';
import { useApp } from '@/context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onPicked: (user: User) => void;
}

export default function FakeGoogleModal({ open, onClose, onPicked }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useApp();

  if (!open) return null;

  async function handlePick(user: User) {
    setLoadingId(user.id);
    await simulateSignIn(user.id);
    setLoadingId(null);
    toast(`Signed in as ${user.name}`, 'success');
    onPicked(user);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-base-850 border border-base-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-base-700">
          <div>
            <h2 className="font-semibold text-lg">Choose an account</h2>
            <p className="text-xs text-gray-400">to continue to Music Creator Platform</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-base-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {SEED_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handlePick(user)}
              disabled={loadingId !== null}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-base-800 transition text-left disabled:opacity-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-base-700"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              {loadingId === user.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-gray-500">
                  {user.plan.replace('_', ' ')}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-base-700 bg-base-900/50">
          <p className="text-[11px] text-gray-500 text-center">
            🔒 Demo only — no real Google account is used.
          </p>
        </div>
      </div>
    </div>
  );
}