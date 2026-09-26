'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function DemoBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-850/90 backdrop-blur border border-base-700 text-xs font-medium hover:border-accent/50 transition"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        Demo Mode
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-base-850 border border-base-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold">🎓 Academic Demonstration</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-base-800 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Auth is simulated (pick-from-list)</li>
              <li>• Payments are simulated (no real charge)</li>
              <li>• Backend: Firebase Realtime Database</li>
              <li>• Built with: Next.js 14 • Firebase • Vercel</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Built for academic demonstration
            </p>
          </div>
        </div>
      )}
    </>
  );
}