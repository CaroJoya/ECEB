'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { simulateSwitchUser } from '@/lib/fake-auth';
import { planLabel, classNames } from '@/lib/helpers';

export default function AccountSwitcher() {
  const { currentUser, allUsers, switchUser, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!currentUser) return null;

  async function handleSwitch(userId: string) {
    if (userId === currentUser!.id) {
      setOpen(false);
      return;
    }
    setSwitchingId(userId);
    await simulateSwitchUser(userId);
    switchUser(userId);
    setSwitchingId(null);
    setOpen(false);
    toast('Switched account', 'success');
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-base-800 hover:bg-base-700 border border-base-700 rounded-lg px-2 py-1.5 transition"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-6 h-6 rounded-full"
        />
        <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
          {currentUser.name.split(' ')[0]}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-base-850 border border-base-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-base-700">
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              Switch account
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {allUsers.map((u) => {
              const active = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSwitch(u.id)}
                  disabled={switchingId !== null}
                  className={classNames(
                    'w-full flex items-center gap-3 px-3 py-2 hover:bg-base-800 transition text-left',
                    active && 'bg-base-800/60'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {planLabel(u.plan)}
                    </p>
                  </div>
                  {switchingId === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  ) : active ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}