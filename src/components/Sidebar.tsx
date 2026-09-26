'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Compass,
  Users,
  Upload,
  LayoutDashboard,
  MessageCircle,
  Bell,
  User,
  Settings as SettingsIcon,
  Shield,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  classNames,
  planLabel,
  getPlanBadgeColor,
  isTopPlan,
} from '@/lib/helpers';

const NAV = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/collaborate', label: 'Collaborate', icon: Users },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User, dynamic: true },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, unreadCount, showPaymentModal, showUpgradeModal } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const nav = [...NAV];
  if (currentUser.plan === 'admin') {
    nav.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  function handleUpgrade() {
    showPaymentModal('pro');
  }

  const top = isTopPlan(currentUser.plan);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-lg bg-base-850 border border-base-700"
        aria-label="Open sidebar"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}

      <aside
        className={classNames(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-base-850 border-r border-base-700 flex flex-col transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-700">
          <Link href="/discover" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-sm">Music Creator</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-base-800"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const href = item.dynamic
              ? `/profile/${currentUser.id}`
              : item.href;
            const active =
              pathname === href ||
              (item.href !== '/profile' && pathname.startsWith(item.href));
            const isLocked =
              item.href === '/upload' && currentUser.plan === 'free_listener';

            return (
              <Link
                key={item.href}
                href={isLocked ? '#' : href}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    showUpgradeModal('Uploads');
                  } else {
                    setMobileOpen(false);
                  }
                }}
                className={classNames(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                  active
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-gray-300 hover:bg-base-800'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.href === '/notifications' && unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                {isLocked && <Lock className="w-3 h-3 text-warning" />}
              </Link>
            );
          })}
        </nav>

        {/* Plan card */}
        <div className="p-3 border-t border-base-700">
          <div className="bg-base-800 border border-base-700 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              Current Plan
            </p>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={classNames(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
                  getPlanBadgeColor(currentUser.plan)
                )}
              >
                {planLabel(currentUser.plan)}
              </span>
            </div>

            {top ? (
              <p className="text-[11px] text-gray-400">
                You&apos;re on the highest plan ✨
              </p>
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full flex items-center justify-between gap-1 bg-accent hover:bg-accent-light text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition"
              >
                Upgrade
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <Link
              href="/pricing"
              className="block text-center text-[11px] text-gray-400 hover:text-accent mt-2 transition"
            >
              Compare plans →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}