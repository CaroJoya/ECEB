'use client';

import { useState } from 'react';
import { Check, Loader2, Sparkles, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import { PLANS } from '@/lib/config';
import type { PlanKey } from '@/types';
import { formatPrice, classNames } from '@/lib/helpers';

type Stage = 'review' | 'processing' | 'done';

export default function FakePaymentModal() {
  const { isPaymentOpen, paymentPlan, hidePaymentModal, currentUser, toast } = useApp();
  const [stage, setStage] = useState<Stage>('review');

  if (!isPaymentOpen || !paymentPlan || !currentUser) return null;

  const plan = PLANS[paymentPlan];

  function reset() {
    setStage('review');
  }

  function close() {
    reset();
    hidePaymentModal();
  }

  async function confirm() {
    setStage('processing');
    setTimeout(async () => {
      try {
        if (db) {
          await update(ref(db, `users/${currentUser!.id}`), {
            plan: paymentPlan,
          });
          await update(ref(db, `subscriptions/${currentUser!.id}`), {
            plan: paymentPlan,
            startDate: Date.now(),
            endDate: Date.now() + 365 * 86400000,
          });
          const notifId = `notif_${Date.now()}`;
          await update(ref(db, `notifications/${currentUser!.id}/${notifId}`), {
            id: notifId,
            type: 'payment',
            title: 'Plan upgraded',
            message: `You're now on ${plan.label} 🎉`,
            read: false,
            createdAt: Date.now(),
          });
        }
        setStage('done');
        toast(`Upgraded to ${plan.label} 🎉`, 'success');
      } catch (e) {
        console.warn('[payment]', e);
        toast('Something went wrong', 'error');
        setStage('review');
      }
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-base-850 border border-base-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-base-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="font-semibold">Upgrade plan</h2>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-base-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {stage === 'review' && (
          <>
            <div className="p-5 space-y-4">
              <div className="bg-base-900 border border-base-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{plan.label}</p>
                  <p className="text-accent font-bold">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                    <span className="text-xs text-gray-500 font-normal">/yr</span>
                  </p>
                </div>
                <ul className="text-sm text-gray-400 space-y-1.5 mt-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent" />
                    Uploads: {plan.uploads === Infinity ? 'Unlimited' : plan.uploads}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent" />
                    Commission: {plan.commission}%
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent" />
                    Analytics: {plan.analytics}
                  </li>
                </ul>
              </div>
              <p className="text-[11px] text-gray-500 text-center">
                🔒 Demo only — no real payment is processed.
              </p>
            </div>
            <div className="p-4 border-t border-base-700 flex justify-end gap-2">
              <button
                onClick={close}
                className="px-4 py-2 rounded-lg bg-base-800 hover:bg-base-700 text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-light text-black font-semibold text-sm transition"
              >
                Confirm Payment
              </button>
            </div>
          </>
        )}

        {stage === 'processing' && (
          <div className="p-10 flex flex-col items-center text-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="font-medium">Processing...</p>
            <p className="text-xs text-gray-500 mt-1">Simulating payment gateway</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mb-4 animate-pulse-slow">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <p className="font-semibold text-lg">Payment Done 🎉</p>
            <p className="text-sm text-gray-400 mt-1">
              You&apos;re now on {plan.label}
            </p>
            <button
              onClick={close}
              className={classNames(
                'mt-6 px-5 py-2 rounded-lg bg-accent hover:bg-accent-light text-black font-semibold text-sm transition'
              )}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}