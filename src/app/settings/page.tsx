'use client';

import { useApp } from '@/context/AppContext';
import { Settings as SettingsIcon, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please sign in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="bg-base-850 border border-base-700 rounded-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-medium">Account</p>
          <p className="text-xs text-gray-400 mt-1">
            Signed in as {currentUser.name} ({currentUser.email})
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Plan</p>
          <p className="text-xs text-gray-400 mt-1">
            {currentUser.plan}{' '}
            <Link href="/pricing" className="text-accent hover:underline">
              Change plan →
            </Link>
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Legal</p>
          <p className="text-xs text-gray-400 mt-1">
            <Link href="/legal/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>{' '}
            •{' '}
            <Link href="/legal/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}