'use client';

import { Check, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PLANS } from '@/lib/config';
import type { PlanKey } from '@/types';
import { classNames, formatPrice } from '@/lib/helpers';

const ORDER: PlanKey[] = [
  'free',
  'pro',
  'studio',
  'premium_listener',
];

export default function PricingPage() {
  const { currentUser, showPaymentModal } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Simple, transparent pricing
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Pick your plan
        </h1>
        <p className="text-gray-400">
          Upgrade any time. Cancel never (it&apos;s a demo).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ORDER.map((key) => {
          const plan = PLANS[key];
          const active = currentUser?.plan === key;
          const highlight = key === 'pro';

          return (
            <div
              key={key}
              className={classNames(
                'relative bg-base-850 border rounded-2xl p-5 flex flex-col transition',
                highlight
                  ? 'border-accent/60 shadow-glow-sm'
                  : 'border-base-700 hover:border-base-600'
              )}
            >
              {highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-accent text-black text-[10px] font-bold uppercase tracking-wider">
                  Popular
                </span>
              )}

              <h2 className="font-semibold text-lg">{plan.label}</h2>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-gray-500">/year</span>
                )}
              </div>

              <ul className="space-y-2 text-sm text-gray-300 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  Uploads: {plan.uploads === Infinity ? 'Unlimited' : plan.uploads}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  Commission: {plan.commission}%
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  Analytics: {plan.analytics}
                </li>
              </ul>

              <button
                onClick={() => showPaymentModal(key)}
                disabled={active}
                className={classNames(
                  'mt-5 w-full py-2.5 rounded-lg font-semibold text-sm transition',
                  active
                    ? 'bg-base-800 text-gray-500 cursor-not-allowed'
                    : highlight
                    ? 'bg-accent hover:bg-accent-light text-black'
                    : 'bg-base-800 hover:bg-base-700 text-white'
                )}
              >
                {active ? 'Current Plan' : plan.price === 0 ? 'Switch' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard title="Brand / Advertiser" desc="License music for campaigns. Detailed analytics." />
        <InfoCard title="Label / Studio" desc="Unlimited uploads. Full analytics. 10% commission." />
        <InfoCard title="Admin" desc="Full platform access. Moderation tools." />
      </div>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-base-850 border border-base-700 rounded-xl p-4">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
      <p className="text-[10px] text-gray-600 mt-2">Contact sales (demo)</p>
    </div>
  );
}