'use client';

import { SEED_USERS } from './seed-data';
import type { User } from '@/types';

const CURRENT_USER_KEY = 'currentUserId';

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, userId);
  console.log('[Demo] Using simulated auth');
}

export function clearCurrentUserId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
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
    }, 800);
  });
}

export function simulateSwitchUser(userId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      setCurrentUserId(userId);
      resolve();
    }, 500);
  });
}