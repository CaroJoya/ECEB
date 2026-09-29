'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { onValue, ref, update, remove, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { SEED_USERS, SEED_NOTIFICATIONS } from '@/lib/seed-data';
import {
  getCurrentUserId,
  setCurrentUserId,
  clearCurrentUserId,
} from '@/lib/fake-auth';
import type {
  User,
  AppNotification,
  PlanKey,
  Toast,
  ToastType,
} from '@/types';

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
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  addNotification: (
    notif: Omit<AppNotification, 'createdAt' | 'read'> & {
      createdAt?: number;
      read?: boolean;
    }
  ) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(SEED_USERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<PlanKey | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ---- Restore persisted user on mount ----
  useEffect(() => {
    const stored = getCurrentUserId();
    if (stored) {
      setCurrentUserIdState(stored);
    }
    setLoading(false);
  }, []);

  // ---- Subscribe to users list (Firebase or seed fallback) ----
  useEffect(() => {
    if (!db) {
      setAllUsers(SEED_USERS);
      return;
    }
    const usersRef = ref(db, 'users');
    const unsub = onValue(
      usersRef,
      (snap) => {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const arr = Object.values(val) as User[];
          setAllUsers(arr.length ? arr : SEED_USERS);
        } else {
          setAllUsers(SEED_USERS);
        }
      },
      (err) => {
        console.warn('[AppContext] users subscription error', err);
        setAllUsers(SEED_USERS);
      }
    );
    return () => unsub();
  }, []);

  // ---- Subscribe to current user's notifications ----
  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }
    if (!db) {
      const seed = SEED_NOTIFICATIONS[currentUserId];
      setNotifications(seed ? Object.values(seed) : []);
      return;
    }
    const notifRef = ref(db, `notifications/${currentUserId}`);
    const unsub = onValue(
      notifRef,
      (snap) => {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const arr = Object.values(val) as AppNotification[];
          arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setNotifications(arr);
        } else {
          const seed = SEED_NOTIFICATIONS[currentUserId];
          setNotifications(seed ? Object.values(seed) : []);
        }
      },
      (err) => {
        console.warn('[AppContext] notifications subscription error', err);
        const seed = SEED_NOTIFICATIONS[currentUserId];
        setNotifications(seed ? Object.values(seed) : []);
      }
    );
    return () => unsub();
  }, [currentUserId]);

  // ---- Derive currentUser from id + live users list ----
  const currentUser = useMemo<User | null>(() => {
    if (!currentUserId) return null;
    return (
      allUsers.find((u) => u.id === currentUserId) ||
      SEED_USERS.find((u) => u.id === currentUserId) ||
      null
    );
  }, [currentUserId, allUsers]);

  const login = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setCurrentUserIdState(userId);
  }, []);

  const logout = useCallback(() => {
    clearCurrentUserId();
    setCurrentUserIdState(null);
    setNotifications([]);
  }, []);

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setCurrentUserIdState(userId);
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
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // ---- Notification actions ----

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (!currentUserId) return;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      if (!db) return;
      try {
        await update(ref(db, `notifications/${currentUserId}/${id}`), {
          read: true,
        });
      } catch (e) {
        console.warn('[AppContext] markNotificationRead failed', e);
      }
    },
    [currentUserId]
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!currentUserId) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (!db) return;
    try {
      const updates: Record<string, boolean> = {};
      notifications.forEach((n) => {
        if (!n.read) updates[`${n.id}/read`] = true;
      });
      if (Object.keys(updates).length) {
        await update(ref(db, `notifications/${currentUserId}`), updates);
      }
    } catch (e) {
      console.warn('[AppContext] markAllNotificationsRead failed', e);
    }
  }, [currentUserId, notifications]);

  const clearNotifications = useCallback(async () => {
    if (!currentUserId) return;

    setNotifications([]);

    if (!db) return;
    try {
      await remove(ref(db, `notifications/${currentUserId}`));
    } catch (e) {
      console.warn('[AppContext] clearNotifications failed', e);
    }
  }, [currentUserId]);

  const addNotification = useCallback(
    async (
      notif: Omit<AppNotification, 'createdAt' | 'read'> & {
        createdAt?: number;
        read?: boolean;
      }
    ) => {
      if (!currentUserId) return;
      const full: AppNotification = {
        ...notif,
        read: notif.read ?? false,
        createdAt: notif.createdAt ?? Date.now(),
      };
      if (!db) {
        setNotifications((prev) => [full, ...prev]);
        return;
      }
      try {
        await set(ref(db, `notifications/${currentUserId}/${full.id}`), full);
      } catch (e) {
        console.warn('[AppContext] addNotification failed', e);
      }
    },
    [currentUserId]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

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
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    addNotification,
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