'use client';

import Link from 'next/link';
import {
  Bell,
  MessageCircle,
  IndianRupee,
  Users,
  Star,
  Info,
  TrendingUp,
  Check,
  Trash2,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { AppNotification } from '@/types';
import { classNames, timeAgo } from '@/lib/helpers';

const ICON_MAP: Record<AppNotification['type'], React.ElementType> = {
  message: MessageCircle,
  payment: IndianRupee,
  collab: Users,
  review: Star,
  system: Info,
  promo: TrendingUp,
};

const COLOR_MAP: Record<AppNotification['type'], string> = {
  message: 'text-info',
  payment: 'text-accent',
  collab: 'text-purple',
  review: 'text-warning',
  system: 'text-gray-400',
  promo: 'text-pink',
};

export default function NotificationsPage() {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    toast,
  } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">
          Please sign in to view notifications.
        </p>
      </div>
    );
  }

  const items = notifications;
  const unread = items.filter((n) => !n.read).length;

  async function handleMarkAll() {
    await markAllNotificationsRead();
    toast('All marked as read', 'success');
  }

  async function handleClear() {
    await clearNotifications();
    toast('Notifications cleared', 'success');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold">Notifications</h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold">
              {unread} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAll}
            disabled={!unread}
            className="inline-flex items-center gap-1.5 text-xs bg-base-800 hover:bg-base-700 disabled:opacity-40 px-3 py-1.5 rounded-lg transition"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
          <button
            onClick={handleClear}
            disabled={!items.length}
            className="inline-flex items-center gap-1.5 text-xs bg-base-800 hover:bg-base-700 disabled:opacity-40 px-3 py-1.5 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-base-850 border border-base-700 rounded-xl py-16 text-center">
          <Bell className="w-10 h-10 text-base-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            You&apos;re all caught up 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICON_MAP[n.type] || Info;
            const color = COLOR_MAP[n.type] || 'text-gray-400';

            const inner = (
              <>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-base-800 border border-base-700 flex-shrink-0">
                  <Icon className={classNames('w-4 h-4', color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                )}
              </>
            );

            const baseClass = classNames(
              'flex items-start gap-3 p-4 rounded-xl border transition cursor-pointer',
              n.read
                ? 'bg-base-850 border-base-700 hover:border-base-600'
                : 'bg-base-850 border-accent/30 hover:border-accent/50'
            );

            if (n.link) {
              return (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => markNotificationRead(n.id)}
                  className={baseClass}
                >
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={n.id}
                type="button"
                onClick={() => markNotificationRead(n.id)}
                className={classNames(baseClass, 'w-full text-left')}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}