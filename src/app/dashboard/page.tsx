'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { onValue, ref } from 'firebase/database';
import {
  LayoutDashboard,
  Upload,
  Play,
  IndianRupee,
  TrendingUp,
  Users,
  ArrowUpRight,
  Lock,
  Music,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import TrackCard from '@/components/TrackCard';
import type { Track, Order, User, PlanKey } from '@/types';
import {
  classNames,
  formatPrice,
  commissionFor,
  planLabel,
  getPlanBadgeColor,
  canUpload,
} from '@/lib/helpers';
import { SEED_TRACKS, SEED_ORDERS } from '@/lib/seed-data';

export default function DashboardPage() {
  const { currentUser, showPaymentModal } = useApp();
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

  const isListener =
    currentUser.plan === 'free_listener' ||
    currentUser.plan === 'premium_listener';
  const isBrand = currentUser.plan === 'brand';
  const isCreator = !isListener && !isBrand;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
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
        {isCreator && canUpload(currentUser.plan) > 0 && (
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            <Upload className="w-4 h-4" /> Upload
          </Link>
        )}
      </div>

      {/* LISTENER DASHBOARD */}
      {isListener && <ListenerDashboard user={currentUser} />}

      {/* BRAND DASHBOARD */}
      {isBrand && <BrandDashboard />}

      {/* CREATOR DASHBOARD */}
      {isCreator && (
        <CreatorDashboard
          user={currentUser}
          tracks={tracks}
          myTracks={myTracks}
          mySales={mySales}
          totalPlays={totalPlays}
          grossRevenue={grossRevenue}
          netRevenue={netRevenue}
          commission={commission}
          analyticsLevel={analyticsLevel}
          showPaymentModal={showPaymentModal}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// LISTENER DASHBOARD
// ─────────────────────────────────────────────
function ListenerDashboard({ user }: { user: User }) {
  const isPremium = user.plan === 'premium_listener';

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-base-850 to-base-800 border border-base-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">
          Welcome, {user.name.split(' ')[0]} 🎧
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {isPremium
            ? 'Premium Listener — full-length streaming, ad-free.'
            : 'Free Listener — 30-second previews only.'}
        </p>
        {!isPremium && (
          <button
            onClick={() => {
              window.location.href = '/pricing';
            }}
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            Upgrade to Premium Listener — ₹99/yr
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoTile icon={Music} label="Discover Tracks" href="/discover" />
        <InfoTile icon={Users} label="Find Creators" href="/collaborate" />
        <InfoTile icon={MessageCircle} label="Open Chat" href="/chat" />
      </div>

      <div className="bg-base-850 border border-base-700 rounded-xl p-5">
        <h3 className="font-semibold mb-3">Your Streaming Tier</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={classNames(
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border',
              isPremium
                ? 'bg-pink/20 text-pink border-pink/40'
                : 'bg-base-700 text-gray-300 border-base-600'
            )}
          >
            {isPremium ? '💎 Full Stream' : '🎵 30s Preview'}
          </span>
          <span className="text-xs text-gray-500">
            {isPremium
              ? 'Unlimited playback on every track'
              : 'Upgrade to unlock full-length playback'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BRAND DASHBOARD
// ─────────────────────────────────────────────
function BrandDashboard() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-warning/10 to-base-850 border border-warning/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">
          Brand Campaign Dashboard 📢
        </h2>
        <p className="text-sm text-gray-400">
          Discover tracks, license music for ads, and track campaign
          performance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Impressions"
          value="24,400"
          accent="text-warning"
        />
        <StatCard
          icon={Eye}
          label="Clicks"
          value="1,890"
          accent="text-info"
        />
        <StatCard
          icon={Music}
          label="Licensed Tracks"
          value="7"
          accent="text-accent"
        />
        <StatCard
          icon={IndianRupee}
          label="Campaign Spend"
          value="₹18,500"
          accent="text-purple"
        />
      </div>

      <div className="bg-base-850 border border-base-700 rounded-xl p-5">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/discover"
            className="flex items-center gap-3 bg-base-800 hover:bg-base-750 border border-base-700 rounded-lg p-4 transition"
          >
            <Music className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Browse Catalog</p>
              <p className="text-[11px] text-gray-500">
                Find music for your next campaign
              </p>
            </div>
          </Link>
          <Link
            href="/discover"
            className="flex items-center gap-3 bg-base-800 hover:bg-base-750 border border-base-700 rounded-lg p-4 transition"
          >
            <TrendingUp className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Promote a Track</p>
              <p className="text-[11px] text-gray-500">
                Feature a creator in your campaign
              </p>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-base-850 border border-base-700 rounded-xl p-5">
        <h3 className="font-semibold mb-2">Recent Campaigns</h3>
        <div className="space-y-2">
          {[
            { name: 'TuneCo Summer Ad', status: 'Active', spend: '₹8,500' },
            { name: 'Diwali Fest Promo', status: 'Active', spend: '₹5,000' },
            { name: 'Winter Playlist', status: 'Completed', spend: '₹5,000' },
          ].map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between px-4 py-3 bg-base-800 border border-base-700 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-[11px] text-gray-500">{c.status}</p>
              </div>
              <p className="text-sm font-semibold text-accent">{c.spend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CREATOR DASHBOARD
// ─────────────────────────────────────────────
function CreatorDashboard({
  user,
  tracks,
  myTracks,
  mySales,
  totalPlays,
  grossRevenue,
  netRevenue,
  commission,
  analyticsLevel,
  showPaymentModal,
}: {
  user: User;
  tracks: Track[];
  myTracks: Track[];
  mySales: Order[];
  totalPlays: number;
  grossRevenue: number;
  netRevenue: number;
  commission: number;
  analyticsLevel: string;
  showPaymentModal: (plan: PlanKey) => void;
}) {
  const isTopTier =
    user.plan === 'studio' || user.plan === 'label' || user.plan === 'admin';
  const uploadsAllowed = canUpload(user.plan);

  return (
    <>
      {/* Creator Tier summary */}
      <div className="bg-base-850 border border-base-700 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Creator Tier
          </p>
          <p className="text-lg font-semibold">{planLabel(user.plan)}</p>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div>
            <p className="text-gray-500">Commission</p>
            <p className="font-semibold text-accent">{commission}%</p>
          </div>
          <div>
            <p className="text-gray-500">Uploads</p>
            <p className="font-semibold">
              {uploadsAllowed === Infinity ? '∞' : uploadsAllowed}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Analytics</p>
            <p className="font-semibold">{analyticsLevel}</p>
          </div>
        </div>
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

      {/* Analytics */}
      <div className="bg-base-850 border border-base-700 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="font-semibold">Analytics</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Level:{' '}
              <span className="text-accent font-medium">{analyticsLevel}</span>
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
          {analyticsLevel === 'Full' && (
            <span className="text-[11px] text-accent border border-accent/40 bg-accent/10 px-2.5 py-1 rounded-full font-semibold">
              ✨ Full Analytics Unlocked
            </span>
          )}
        </div>
        <MiniBarChart
          values={
            analyticsLevel === 'Full'
              ? [12, 18, 9, 24, 32, 28, 40, 36, 45, 52]
              : [12, 18, 9, 24, 32, 28, 40]
          }
        />
      </div>

      {/* Promotions - only for pro/studio/label/admin */}
      {user.plan !== 'free' && (
        <div className="bg-base-850 border border-base-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-semibold">Promotions</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isTopTier
                  ? 'Unlimited promotions available.'
                  : '1 track per week on Pro.'}
              </p>
            </div>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 bg-base-800 hover:bg-base-700 text-xs px-3 py-1.5 rounded-lg transition"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Promote a Track
            </Link>
          </div>
        </div>
      )}

      {/* My tracks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">My Tracks</h2>
          <span className="text-xs text-gray-500">{myTracks.length} total</span>
        </div>
        {myTracks.length === 0 ? (
          <div className="bg-base-850 border border-base-700 rounded-xl py-12 text-center">
            <p className="text-sm text-gray-400 mb-3">
              No tracks uploaded yet.
            </p>
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
              <TrackCard key={t.id} track={t} owner={user} />
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
    </>
  );
}

// ─────────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────────
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
      <p className="text-[11px] uppercase tracking-wider text-gray-500">
        {label}
      </p>
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

function InfoTile({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-base-850 border border-base-700 rounded-xl p-4 hover:border-base-600 transition flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}