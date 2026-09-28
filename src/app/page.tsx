'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Music,
  Users,
  Upload,
  MessageCircle,
  IndianRupee,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function HomePage() {
  const { currentUser, loading } = useApp();
  const router = useRouter();

  // Safety net: if middleware was bypassed (e.g. cookie missing but
  // localStorage present), bounce signed-in users to /discover.
  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/discover');
    }
  }, [currentUser, loading, router]);

  if (loading || currentUser) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: 'Collaborate',
      desc: 'Match with creators by genre, skill, and vibe. Real-time chat built in.',
    },
    {
      icon: Upload,
      title: 'Upload & License',
      desc: 'Six license types from Open Collab to All Rights Reserved.',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      desc: 'Typing indicators, read receipts, cross-device. All live.',
    },
    {
      icon: IndianRupee,
      title: 'Get Paid',
      desc: 'Sell your tracks. Fair commission tiers (20/15/10%).',
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      desc: 'Track plays, earnings, and audience growth by plan tier.',
    },
    {
      icon: Shield,
      title: 'Safe & Fair',
      desc: 'Licensing, dispute resolution, and admin moderation.',
    },
  ];

  return (
    <div className="min-h-screen bg-base-900">
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Academic Demo • Firebase-powered
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Where music creators{' '}
            <span className="text-accent">collaborate</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Discover collaborators, license tracks, chat in real time, and get
            paid. All in one dark-themed platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-black font-semibold px-6 py-3 rounded-lg transition"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-base-800 hover:bg-base-700 text-white px-6 py-3 rounded-lg transition"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-base-850 border border-base-700 rounded-xl p-5 hover:border-base-600 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-base-850 to-base-800 border border-base-700 rounded-2xl p-8 sm:p-12 text-center">
          <Music className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to make something?
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Join the demo. Pick a creator. Start uploading, chatting, and
            getting paid.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-black font-semibold px-6 py-3 rounded-lg transition"
          >
            <Play className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}