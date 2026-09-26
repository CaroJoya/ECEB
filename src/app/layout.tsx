// src/app/layout.tsx  (REPLACE the earlier version)
'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { AppProvider, useApp } from '@/context/AppContext';
import DemoBadge from '@/components/DemoBadge';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import FakePaymentModal from '@/components/FakePaymentModal';
import { CheckCircle2, Info, XCircle, X, Lock } from 'lucide-react';
import { classNames } from '@/lib/helpers';

function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-4 right-4 z-[120] space-y-2 max-w-sm">
      {toasts.map((t) => {
        const Icon =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'error'
            ? XCircle
            : Info;
        const color =
          t.type === 'success'
            ? 'text-accent'
            : t.type === 'error'
            ? 'text-danger'
            : 'text-info';
        return (
          <div
            key={t.id}
            className="bg-base-850 border border-base-700 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 animate-slide-up"
          >
            <Icon className={classNames('w-4 h-4 flex-shrink-0', color)} />
            <p className="text-sm text-white">{t.message}</p>
          </div>
        );
      })}
    </div>
  );
}

function UpgradeModal() {
  const { isUpgradeOpen, upgradeFeature, hideUpgradeModal, showPaymentModal, currentUser } =
    useApp();
  if (!isUpgradeOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-base-850 border border-base-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">🔒 Upgrade to unlock</h2>
          </div>
          <button
            onClick={hideUpgradeModal}
            className="p-1 rounded hover:bg-base-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          {upgradeFeature
            ? `"${upgradeFeature}" is available on higher plans.`
            : 'This feature is available on higher plans.'}{' '}
          {currentUser
            ? `You're currently on ${currentUser.plan}.`
            : 'Please sign in first.'}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={hideUpgradeModal}
            className="px-4 py-2 rounded-lg bg-base-800 hover:bg-base-700 text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              hideUpgradeModal();
              showPaymentModal('pro');
            }}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-light text-black font-semibold text-sm transition"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const isAuthPage = pathname === '/login';
  const isLegal = pathname.startsWith('/legal');
  const showSidebar = !!currentUser && !isAuthPage && !isLegal;

  return (
    <>
      <DemoBadge />
      <Navbar />
      {showSidebar && <Sidebar />}
      <div
        className={classNames(
          'min-h-[calc(100vh-56px)] flex flex-col',
          showSidebar && 'lg:pl-64'
        )}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <FakePaymentModal />
      <UpgradeModal />
      <ToastContainer />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-base-900 text-white antialiased">
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}