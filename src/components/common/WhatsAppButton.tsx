'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Language } from '@/types';

interface WhatsAppButtonProps {
  lang: Language;
}

export function WhatsAppButton({ lang }: WhatsAppButtonProps) {
  const isRtl = lang === 'ar';
  const message =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات.")
      : encodeURIComponent("Hello SpeederSpider! I visited your website and would like to enquire about your automotive services.");
  const url = `https://wa.me/971565694440?text=${message}`;

  return (
    <aside aria-label="Quick WhatsApp Contact" className="contents">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-[0_4px_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 ${
          isRtl ? 'left-6' : 'right-6'
        }`}
        title={isRtl ? "محادثة فورية عبر واتساب" : "Chat on WhatsApp"}
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline font-bold tracking-wide">
          {isRtl ? 'تواصل عبر واتساب' : 'WhatsApp'}
        </span>
      </a>
    </aside>
  );
}
