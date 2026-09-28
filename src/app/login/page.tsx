'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Music, AlertCircle } from 'lucide-react';
import FakeGoogleModal from '@/components/FakeGoogleModal';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { ref, update, serverTimestamp } from 'firebase/database';
import type { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, toast, currentUser, loading } = useApp();
  const [googleOpen, setGoogleOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [agreed, setAgreed] = useState(false);

  const nextPath = searchParams.get('next') || '/dashboard';

  // Safety net: already signed in? Go to next or discover.
  useEffect(() => {
    if (!loading && currentUser) {
      router.replace(nextPath);
    }
  }, [currentUser, loading, router, nextPath]);

  function handlePicked(user: User) {
    setGoogleOpen(false);
    login(user.id);

    if (!user.agreedToTerms) {
      setPendingUser(user);
      setLegalOpen(true);
    } else {
      router.push(nextPath);
    }
  }

  async function handleContinue() {
    if (!pendingUser || !agreed) return;
    try {
      if (db) {
        const userRef = ref(db, `users/${pendingUser.id}`);
        await update(userRef, {
          agreedToTerms: true,
          agreedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('[Demo] Could not persist legal acceptance', e);
    }
    toast('Welcome to Music Creator Platform 🎉', 'success');
    setLegalOpen(false);
    router.push(nextPath);
  }

  if (loading || currentUser) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-base-850 border border-base-700 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Music className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-xl font-bold">Music Creator Platform</h1>
          </div>

          <h2 className="text-center text-2xl font-semibold mb-2">
            Sign in to continue
          </h2>
          <p className="text-center text-sm text-gray-400 mb-8">
            Collaborate. Create. Get paid.
          </p>

          <button
            onClick={() => setGoogleOpen(true)}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium px-4 py-3 rounded-lg transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.4-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>
              This is a demo. Sign-in is simulated with a pre-seeded list of
              accounts. No real credentials are used.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          By continuing you agree to our{' '}
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Terms
          </a>{' '}
          and{' '}
          <a
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>

      <FakeGoogleModal
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onPicked={handlePicked}
      />

      {legalOpen && pendingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-base-850 border border-base-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-base-700">
              <h2 className="text-lg font-semibold">Before you continue</h2>
              <p className="text-xs text-gray-400 mt-1">
                Please review and accept our policies
              </p>
            </div>

            <div className="p-6">
              <div className="bg-base-900 border border-base-700 rounded-lg p-4 h-48 overflow-y-auto text-sm text-gray-300 space-y-3">
                <p className="font-semibold text-white">Terms of Service</p>
                <p>
                  By using Music Creator Platform you agree to upload only
                  content you own or have rights to distribute. You retain
                  ownership of your music and grant the platform a limited
                  license to host, stream, and display your content.
                </p>
                <p className="font-semibold text-white">Privacy Policy</p>
                <p>
                  We store account data in Firebase Realtime Database. We do
                  not sell your data. This is an academic demonstration
                  project — auth and payment are simulated.
                </p>
                <p>
                  Read the full policies at{' '}
                  <a
                    href="/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    /legal/terms
                  </a>{' '}
                  and{' '}
                  <a
                    href="/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    /legal/privacy
                  </a>
                  .
                </p>
              </div>

              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#1DB954]"
                />
                <span className="text-sm text-gray-300">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

            <div className="p-4 border-t border-base-700 flex justify-end gap-2">
              <button
                onClick={() => router.push(nextPath)}
                className="px-4 py-2 rounded-lg bg-base-800 hover:bg-base-700 text-sm transition"
              >
                Skip for now
              </button>
              <button
                onClick={handleContinue}
                disabled={!agreed}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-light text-black font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}