'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Music, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import AccountSwitcher from './AccountSwitcher';
import NotificationBell from './NotificationBell';
import { classNames } from '@/lib/helpers';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useApp();

  if (pathname === '/login') return null;

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-30 bg-base-900/80 backdrop-blur border-b border-base-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="font-bold text-sm">Music Creator</span>
        </Link>

        <div className="hidden lg:block text-sm text-gray-500">
          {currentUser ? (
            <span>
              Welcome back,{' '}
              <span className="text-white font-medium">
                {currentUser.name.split(' ')[0]}
              </span>
            </span>
          ) : (
            <span>Collaborate. Create. Get paid.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <NotificationBell />
              <Link
                href={`/profile/${currentUser.id}`}
                className="p-2 rounded-lg hover:bg-base-800 transition"
                aria-label="Profile"
              >
                <UserIcon className="w-5 h-5 text-gray-300" />
              </Link>
              <Link
                href="/settings"
                className="p-2 rounded-lg hover:bg-base-800 transition"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </Link>
              <AccountSwitcher />
              <button
                onClick={handleLogout}
                className={classNames(
                  'p-2 rounded-lg hover:bg-base-800 transition'
                )}
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5 text-gray-300" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-accent hover:bg-accent-light text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}