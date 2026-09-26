'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '@/lib/firebase';
import { SEED_USERS, SEED_NOTIFICATIONS } from '@/lib/seed-data';
import {
  getCurrentUserId,
  setCurrentUserId,
  clearCurrentUserId,
} from '@/lib/fake-auth';
import type { User, AppNotification, PlanKey, Toast, ToastType } from '@/types';

interface AppContextValue {
  currentUser: User | null;
  allUsers: User[];
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  showUpgradeModal: (feature?: string) => void;
  hideUpgradeModal: () => void;
  upgradeFeature: string | null;
  isUpgradeOpen: boolean;
  showPaymentModal: (plan?: PlanKey) => void;
  hidePaymentModal: () => void;
  paymentPlan: PlanKey | null;
  isPaymentOpen: boolean;
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(SEED_USERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<PlanKey | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const stored = getCurrentUserId();
    if (stored) {
      const fallback = SEED_USERS.find((u) => u.id === stored) || null;
      setCurrentUser(fallback);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!db) return;
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') {
        const arr = Object.values(val) as User[];
        setAllUsers(arr.length ? arr : SEED_USERS);
      } else {
        setAllUsers(SEED_USERS);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db || !currentUser) {
      setNotifications([]);
      return;
    }
    const notifRef = ref(db, `notifications/${currentUser.id}`);
    const unsub = onValue(notifRef, (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') {
        setNotifications(Object.values(val) as AppNotification[]);
      } else {
        setNotifications(SEED_NOTIFICATIONS[currentUser.id] || []);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const login = useCallback((userId: string) => {
    setCurrentUserId(userId);
    const u = SEED_USERS.find((x) => x.id === userId) || null;
    setCurrentUser(u);
  }, []);

  const logout = useCallback(() => {
    clearCurrentUserId();
    setCurrentUser(null);
  }, []);

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    const u = SEED_USERS.find((x) => x.id === userId) || null;
    setCurrentUser(u);
  }, []);

  const showUpgradeModal = useCallback((feature?: string) => {
    setUpgradeFeature(feature || null);
    setIsUpgradeOpen(true);
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setIsUpgradeOpen(false);
    setUpgradeFeature(null);
  }, []);

  const showPaymentModal = useCallback((plan?: PlanKey) => {
    setPaymentPlan(plan || null);
    setIsPaymentOpen(true);
  }, []);

  const hidePaymentModal = useCallback(() => {
    setIsPaymentOpen(false);
    setPaymentPlan(null);
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: AppContextValue = {
    currentUser,
    allUsers,
    notifications,
    unreadCount,
    loading,
    login,
    logout,
    switchUser,
    showUpgradeModal,
    hideUpgradeModal,
    upgradeFeature,
    isUpgradeOpen,
    showPaymentModal,
    hidePaymentModal,
    paymentPlan,
    isPaymentOpen,
    toasts,
    toast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}