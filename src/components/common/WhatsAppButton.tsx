'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
} from '@/components/icons/SocialIcons';
import { MessageCircle, X, ChevronUp, ExternalLink } from 'lucide-react';
import { Language } from '@/types';

interface WhatsAppButtonProps {
  lang: Language;
}

export function WhatsAppButton({ lang }: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات.")
      : encodeURIComponent("Hello SpeederSpider! I visited your website and would like to enquire about your automotive services.");

  const socialChannels = [
    {
      id: 'whatsapp',
      name: isRtl ? 'واتساب مباشر' : 'WhatsApp Direct',
      handle: '+971 56 569 4440',
      actionText: isRtl ? 'محادثة فورية' : 'Chat Now',
      url: `https://wa.me/971565694440?text=${whatsappMessage}`,
      icon: WhatsAppIcon,
      badgeColor: 'bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.4)]',
      hoverBorder: 'hover:border-[#25D366]/60 hover:bg-[#25D366]/10',
      accentColor: 'text-[#25D366]',
    },
    {
      id: 'instagram',
      name: isRtl ? 'إنستغرام' : 'Instagram',
      handle: '@speederspiderae',
      actionText: isRtl ? 'متابعة ومشاهدة' : 'Follow & View',
      url: 'https://www.instagram.com/speederspiderae/',
      icon: InstagramIcon,
      badgeColor: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-[0_0_15px_rgba(225,48,108,0.4)]',
      hoverBorder: 'hover:border-[#E1306C]/60 hover:bg-[#E1306C]/10',
      accentColor: 'text-[#E1306C]',
    },
    {
      id: 'facebook',
      name: isRtl ? 'فيسبوك' : 'Facebook',
      handle: 'SpeederSpider Official',
      actionText: isRtl ? 'زيارة الصفحة' : 'Visit Page',
      url: 'https://www.facebook.com/profile.php?id=61596871021810',
      icon: FacebookIcon,
      badgeColor: 'bg-[#1877F2] text-white shadow-[0_0_15px_rgba(24,119,242,0.4)]',
      hoverBorder: 'hover:border-[#1877F2]/60 hover:bg-[#1877F2]/10',
      accentColor: 'text-[#1877F2]',
    },
  ];

  // Auto-close when interacting outside (click outside, press Escape, or scroll)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  return (
    <aside
      ref={menuRef}
      aria-label={isRtl ? 'خيارات التواصل الاجتماعي السريع' : 'Quick Social & Contact Actions'}
      className={`fixed bottom-6 z-50 flex flex-col items-end ${
        isRtl ? 'left-6 items-start' : 'right-6 items-end'
      }`}
    >
      {/* Expanded Multi-Channel Popup Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isRtl ? 'قنوات التواصل' : 'SpeederSpider Contact Channels'}
          className={`mb-3 w-72 rounded-2xl bg-brand-deepNavy/95 border border-brand-cyan/40 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-fade-in transition-all duration-200 ${
            isRtl ? 'origin-bottom-left' : 'origin-bottom-right'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-steelBlue/30 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-gray-300">
                {isRtl ? 'تواصل مع سبيدر سبايدر' : 'CONNECT WITH US'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Channels List */}
          <div className="space-y-1.5">
            {socialChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.id}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-brand-steelBlue/30 bg-brand-navy/60 transition-all hover:scale-[1.02] active:scale-[0.98] group ${channel.hoverBorder}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${channel.badgeColor}`}
                    >
                      <Icon className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-brand-cyan transition-colors">
                        {channel.name}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {channel.handle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-400 group-hover:text-white font-medium pl-2">
                    <span className="hidden sm:inline">{channel.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* Quick Workshop GPS / Telephone Footer Note */}
          <div className="mt-2.5 pt-2 border-t border-brand-steelBlue/20 text-center">
            <span className="text-[10px] font-mono text-gray-400">
              {isRtl ? 'دبي، القوز الصناعية 2 • استجابة فورية' : 'Dubai, Al Quoz 2 • Fast Response'}
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={
          isOpen
            ? isRtl ? 'إغلاق قنوات التواصل' : 'Close contact channels'
            : isRtl ? 'تواصل عبر واتساب، إنستغرام، فيسبوك' : 'Connect via WhatsApp, Instagram & Facebook'
        }
        className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.65)] hover:scale-105 active:scale-95 border ${
          isOpen
            ? 'bg-brand-navy text-white border-brand-cyan/70 shadow-[0_0_20px_rgba(91,192,222,0.35)]'
            : 'bg-gradient-to-r from-brand-deepNavy to-brand-navy text-white border-brand-cyan/40 hover:border-brand-cyan'
        }`}
      >
        {/* Glow ambient background ring */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#25D366] via-brand-cyan to-[#E1306C] opacity-40 blur-sm group-hover:opacity-75 transition duration-300 -z-10" />

        {/* Dynamic Icon or Close Icon */}
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5 text-brand-cyan transition-transform duration-200 rotate-90" />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm">
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white -ml-2.5 shadow-sm">
                <InstagramIcon className="w-3 h-3 fill-current" />
              </div>
              <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-white -ml-2.5 shadow-sm">
                <FacebookIcon className="w-3 h-3 fill-current" />
              </div>
            </div>
          )}
        </div>

        {/* Text Pill */}
        <span className="font-bold text-xs tracking-wide">
          {isOpen
            ? isRtl ? 'إغلاق' : 'Close'
            : isRtl ? 'تواصل معنا' : 'Connect'}
        </span>

        {/* Subtle Indicator Arrow */}
        <ChevronUp
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-cyan' : ''
          }`}
        />
      </button>
    </aside>
  );
}

// Named alias export for developer clarity
export const FloatingSocialMenu = WhatsAppButton;
