import React from 'react';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-deepNavy flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-navy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan shadow-[0_0_25px_rgba(91,192,222,0.3)]">
        <Wrench className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cyan">
          ERROR 404 • ROUTE NOT FOUND
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white uppercase font-display">
          Vehicle Track Off Course
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          The requested page does not exist or has been relocated within the SpeederSpider platform.
        </p>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Link
          href="/en"
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all"
        >
          Return to English Home
        </Link>
        <Link
          href="/ar"
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-brand-navy border border-brand-steelBlue hover:border-brand-cyan rounded-lg transition-all"
        >
          العودة للرئيسية (عربي)
        </Link>
      </div>
    </div>
  );
}
