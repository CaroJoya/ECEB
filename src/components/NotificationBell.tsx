'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { classNames } from '@/lib/helpers';

export default function NotificationBell() {
  const { unreadCount } = useApp();

  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-lg hover:bg-base-800 transition"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-300" />
      {unreadCount > 0 && (
        <span
          className={classNames(
            'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center'
          )}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}