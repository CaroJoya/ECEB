'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Upload,
  Play,
  IndianRupee,
  TrendingUp,
  Star,
  Users,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import TrackCard from '@/components/TrackCard';
import type { Track, Order } from '@/types';
import {
  classNames,
  formatPrice,
  commissionFor,
  planLabel,
  getPlanBadgeColor,
} from '@/lib/helpers';
import { SEED_TRACKS, SEED_ORDERS } from '@/lib/seed-data';

export default function DashboardPage() {
  const { currentUser, showUpgradeModal, showPaymentModal } = useApp();
  const [tracks, setTracks] = useState<Track[]>(SEED_TRACKS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);

  useEffect(() => {
    if (!db) return;
    const tUnsub = onValue(ref(db, 'tracks'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') setTracks(Object.values(val) as Track[]);
    });
    const oUnsub = onValue(ref(db, 'orders'), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') setOrders(Object.values(val) as Order[]);
    });
    return () => {
      tUnsub();
      oUnsub();
    };
  }, []);

  const myTracks = useMemo(
    () => tracks.filter((t) => t.userId === currentUser?.id),
    [tracks, currentUser]
  );

  const mySales = useMemo(
    () => orders.filter((o) => o.sellerId === currentUser?.id),
    [orders, currentUser]
  );

  const totalPlays = myTracks.reduce((sum, t) => sum + t.plays, 0);
  const grossRevenue = mySales.reduce((sum, o) => sum + o.amount, 0);
  const commission = currentUser ? commissionFor(currentUser.plan) : 20;
  const netRevenue = Math.round(grossRevenue * (1 - commission / 100));

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const analyticsLevel =
    currentUser.plan === 'free' || currentUser.plan === 'free_listener'
      ? 'Basic'
      : currentUser.plan === 'pro' || currentUser.plan === 'brand'
      ? 'Detailed'
      : 'Full';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold">Dashboard</h1>
          <span
            className={classNames(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
              getPlanBadgeColor(currentUser.plan)
            )}
          >
            {planLabel(currentUser.plan)}
          </span>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
        >
          <Upload className="w-4 h-4" /> Upload
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Play}
          label="Total Plays"
          value={totalPlays.toLocaleString()}
          accent="text-accent"
        />
        <StatCard
          icon={IndianRupee}
          label="Gross Revenue"
          value={formatPrice(grossRevenue)}
          accent="text-purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Net (after commission)"
          value={formatPrice(netRevenue)}
          accent="text-info"
          sub={`${commission}% commission`}
        />
        <StatCard
          icon={Users}
          label="Tracks"
          value={String(myTracks.length)}
          accent="text-warning"
        />
      </div>

      {/* Analytics tier */}
      <div className="bg-base-850 border border-base-700 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="font-semibold">Analytics</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Level: <span className="text-accent font-medium">{analyticsLevel}</span>
            </p>
          </div>
          {analyticsLevel === 'Basic' && (
            <button
              onClick={() => showPaymentModal('pro')}
              className="text-xs bg-accent hover:bg-accent-light text-black font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Unlock Detailed →
            </button>
          )}
        </div>
        <MiniBarChart values={[12, 18, 9, 24, 32, 28, 40]} />
      </div>

      {/* My tracks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">My Tracks</h2>
          <span className="text-xs text-gray-500">{myTracks.length} total</span>
        </div>
        {myTracks.length === 0 ? (
          <div className="bg-base-850 border border-base-700 rounded-xl py-12 text-center">
            <p className="text-sm text-gray-400 mb-3">No tracks uploaded yet.</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
            >
              <Upload className="w-4 h-4" /> Upload your first
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {myTracks.map((t) => (
              <TrackCard key={t.id} track={t} owner={currentUser} />
            ))}
          </div>
        )}
      </div>

      {/* Recent sales */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Sales</h2>
          <span className="text-xs text-gray-500">{mySales.length} orders</span>
        </div>
        <div className="bg-base-850 border border-base-700 rounded-xl overflow-hidden">
          {mySales.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No sales yet.
            </p>
          ) : (
            mySales.slice(0, 5).map((o) => {
              const track = tracks.find((t) => t.id === o.trackId);
              return (
                <div
                  key={o.id}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 border-base-800"
                >
                  <div className="w-9 h-9 rounded-lg bg-base-800 border border-base-700 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {track?.title || 'Track'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {o.status} • commission {formatPrice(o.commission)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-accent">
                    +{formatPrice(o.amount - o.commission)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="bg-base-850 border border-base-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={classNames('w-4 h-4', accent)} />
        <ArrowUpRight className="w-3.5 h-3.5 text-gray-600" />
      </div>
      <p className="text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-accent/30 hover:bg-accent/60 rounded-t transition"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}