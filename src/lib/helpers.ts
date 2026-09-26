import { formatDistanceToNow, format } from 'date-fns';
import type { User, PlanKey, LicenseKey } from '@/types';
import { PLANS, LICENSE_TYPES } from './config';

export function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function commissionFor(plan: PlanKey): number {
  const p = PLANS[plan];
  return p ? p.commission : 20;
}

export function canUpload(plan: PlanKey): number {
  const p = PLANS[plan];
  return p ? p.uploads : 0;
}

export function planLabel(plan: PlanKey): string {
  const p = PLANS[plan];
  return p ? p.label : 'Free Creator';
}

export function licenseLabel(key: LicenseKey): string {
  const l = LICENSE_TYPES[key];
  return l ? l.name : 'Custom';
}

export function licenseIcon(key: LicenseKey): string {
  const l = LICENSE_TYPES[key];
  return l ? l.icon : '⚙️';
}

export function timeAgo(ts: number): string {
  if (!ts) return 'just now';
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return 'just now';
  }
}

export function formatDate(ts: number): string {
  if (!ts) return '';
  try {
    return format(new Date(ts), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  let intersection = 0;
  setA.forEach((v) => {
    if (setB.has(v)) intersection++;
  });
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function computeMatchScore(me: User, them: User): number {
  if (!me || !them || me.id === them.id) return 0;

  const genreScore = jaccard(me.genres, them.genres) * 40;
  const skillScore = jaccard(me.skills, them.skills) * 30;
  const ratingScore = ((them.rating || 0) / 5) * 20;

  const ageDays = (Date.now() - (them.createdAt || 0)) / 86400000;
  const activityScore = ageDays <= 30 ? 10 : ageDays <= 90 ? 6 : 3;

  const total = genreScore + skillScore + ratingScore + activityScore;
  return Math.round(Math.max(0, Math.min(100, total)));
}

export function getPlanBadgeColor(plan: PlanKey): string {
  switch (plan) {
    case 'pro':
      return 'bg-accent/20 text-accent border-accent/40';
    case 'studio':
      return 'bg-purple/20 text-purple border-purple/40';
    case 'premium_listener':
      return 'bg-pink/20 text-pink border-pink/40';
    case 'label':
      return 'bg-info/20 text-info border-info/40';
    case 'admin':
      return 'bg-danger/20 text-danger border-danger/40';
    case 'brand':
      return 'bg-warning/20 text-warning border-warning/40';
    default:
      return 'bg-base-700 text-gray-300 border-base-600';
  }
}

export function isTopPlan(plan: PlanKey): boolean {
  return plan === 'studio' || plan === 'admin' || plan === 'label';
}

export function truncate(str: string, n: number): string {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}