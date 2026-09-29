'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bell,
  MessageCircle,
  IndianRupee,
  Users,
  Star,
  Info,
  TrendingUp,
  Check,
  X,
  Trash2,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/types';
import {
  classNames,
  timeAgo,
  acceptConnectionRequest,
  declineConnectionRequest,
} from '@/lib/helpers';

const ICON_MAP: Record<AppNotification['type'], React.ElementType> = {
  message: MessageCircle,
  payment: IndianRupee,
  collab: Users,
  review: Star,
  system: Info,
  promo: TrendingUp,
  connection_request: Users,
  connection_accepted: Check,
};

const COLOR_MAP: Record<AppNotification['type'], string> = {
  message: 'text-info',
  payment: 'text-accent',
  collab: 'text-purple',
  review: 'text-warning',
  system: 'text-gray-400',
  promo: 'text-pink',
  connection_request: 'text-accent',
  connection_accepted: 'text-accent',
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
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please sign in to view notifications.</p>
      </div>
    );
  }

  const items = notifications;
  const unread = items.filter((n) => !n.read).length;

  async function handleAccept(n: AppNotification) {
    if (busyId) return;
    setBusyId(n.id);
    const meta = (n as AppNotification & {
      meta?: { requestId: string; fromUserId: string };
    }).meta;

    if (!meta?.requestId || !meta?.fromUserId) {
      toast('Request data missing', 'error');
      setBusyId(null);
      return;
    }

    try {
      await acceptConnectionRequest(
        db,
        meta.requestId,
        meta.fromUserId,
        currentUser!.id,
        currentUser!.name
      );
      await markNotificationRead(n.id);
      toast('Connection accepted ✅', 'success');
    } catch (e) {
      console.warn(e);
      toast('Could not accept', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(n: AppNotification) {
    if (busyId) return;
    setBusyId(n.id);
    const meta = (n as AppNotification & {
      meta?: { requestId: string; fromUserId: string };
    }).meta;

    if (!meta?.requestId) {
      setBusyId(null);
      return;
    }

    try {
      await declineConnectionRequest(db, meta.requestId);
      await markNotificationRead(n.id);
      toast('Request declined', 'info');
    } catch (e) {
      console.warn(e);
      toast('Could not decline', 'error');
    } finally {
      setBusyId(null);
    }
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
            onClick={async () => {
              await markAllNotificationsRead();
              toast('All marked as read', 'success');
            }}
            disabled={!unread}
            className="inline-flex items-center gap-1.5 text-xs bg-base-800 hover:bg-base-700 disabled:opacity-40 px-3 py-1.5 rounded-lg transition"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
          <button
            onClick={async () => {
              await clearNotifications();
              toast('Notifications cleared', 'success');
            }}
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
            const isConnReq = n.type === 'connection_request' && !n.read;

            return (
              <div
                key={n.id}
                className={classNames(
                  'flex items-start gap-3 p-4 rounded-xl border transition',
                  n.read
                    ? 'bg-base-850 border-base-700 hover:border-base-600'
                    : 'bg-base-850 border-accent/30 hover:border-accent/50'
                )}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-base-800 border border-base-700 flex-shrink-0">
                  <Icon className={classNames('w-4 h-4', color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>

                  {isConnReq && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(n)}
                        disabled={busyId === n.id}
                        className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {busyId === n.id ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleDecline(n)}
                        disabled={busyId === n.id}
                        className="inline-flex items-center gap-1.5 bg-base-800 hover:bg-base-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  )}

                  {!isConnReq && n.link && (
                    <Link
                      href={n.link}
                      onClick={() => markNotificationRead(n.id)}
                      className="inline-block mt-2 text-[11px] text-accent hover:underline"
                    >
                      Open →
                    </Link>
                  )}

                  {!isConnReq && !n.link && !n.read && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="inline-block mt-2 text-[11px] text-gray-400 hover:text-accent"
                    >
                      Mark as read
                    </button>
                  )}
                </div>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}