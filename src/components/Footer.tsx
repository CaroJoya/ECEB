import Link from 'next/link';
import { Music, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-base-800 bg-base-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Music className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="font-bold text-sm">Music Creator Platform</span>
            </div>
            <p className="text-xs text-gray-500">
              Collaborate. Create. Get paid.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              Legal
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-accent transition"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              About
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Built for academic demonstration. Auth and payments are
              simulated. Backend powered by Firebase Realtime Database.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-gray-600 hover:text-accent transition cursor-pointer">
                <Github className="w-4 h-4" />
              </span>
              <span className="text-gray-600 hover:text-accent transition cursor-pointer">
                <Twitter className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-base-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-600">
            © {new Date().getFullYear()} Music Creator Platform. Built for
            academic demonstration.
          </p>
          <p className="text-[11px] text-gray-600">
            Next.js 14 • Firebase • Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}