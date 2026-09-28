'use client';

import { SEED_USERS } from './seed-data';
import type { User } from '@/types';

const CURRENT_USER_KEY = 'currentUserId';

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      localStorage.getItem(CURRENT_USER_KEY) ||
      getCookie(CURRENT_USER_KEY)
    );
  } catch {
    return null;
  }
}

export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
    // Also set a cookie so middleware can read it
    document.cookie = `${CURRENT_USER_KEY}=${encodeURIComponent(
      userId
    )}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    console.log('[Demo] Using simulated auth for', userId);
  } catch (e) {
    console.warn('[Demo] Could not persist current user', e);
  }
}

export function clearCurrentUserId(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    document.cookie = `${CURRENT_USER_KEY}=; path=/; max-age=0; samesite=lax`;
  } catch {
    /* noop */
  }
}

export function getSeedUsers(): User[] {
  return SEED_USERS;
}

export function findSeedUser(userId: string): User | undefined {
  return SEED_USERS.find((u) => u.id === userId);
}

export function simulateSignIn(userId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      setCurrentUserId(userId);
      resolve();
    }, 600);
  });
}

export function simulateSwitchUser(userId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      setCurrentUserId(userId);
      resolve();
    }, 400);
  });
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}