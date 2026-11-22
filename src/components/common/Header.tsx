'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { Menu, X, MessageSquare, Globe, ChevronDown, Wrench } from 'lucide-react';

interface HeaderProps {
  lang: Language;
}

export function Header({ lang }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dict = dictionaries[lang];
  const isRtl = lang === 'ar';

  const otherLang: Language = lang === 'en' ? 'ar' : 'en';
  // Compute alternate path
  const alternatePath = pathname.replace(`/${lang}`, `/${otherLang}`);

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات.")
      : encodeURIComponent("Hello SpeederSpider! I visited your website and would like to enquire about your automotive services.");
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  const navLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/services`, label: dict.nav.services, hasDropdown: true },
    { href: `/${lang}/our-work`, label: dict.nav.portfolio },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-deepNavy/90 backdrop-blur-md border-b border-brand-steelBlue/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-navy border border-brand-cyan/40 text-brand-cyan group-hover:border-brand-cyan transition-colors">
              <Wrench className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-widest text-white uppercase font-display leading-tight">
                SPEEDER<span className="text-brand-cyan">SPIDER</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-gray-400 font-mono">
                {isRtl ? 'دبي • تعديل وصيانة السيارات' : 'DUBAI • AUTOMOTIVE ATELIER'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                {link.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-brand-cyan transition-colors py-2"
                    >
                      {link.label}
                      <ChevronDown className="w-4 h-4 opacity-70" />
                    </Link>

                    {servicesDropdownOpen && (
                      <div className="absolute top-full left-0 w-64 bg-brand-navy border border-brand-steelBlue/40 rounded-lg shadow-2xl py-2 z-50">
                        <Link href={`/${lang}/services/upholstery`} className="block px-4 py-2 text-xs text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan">
                          {isRtl ? 'تنجيد السيارات الفاخرة' : 'Custom Automotive Upholstery'}
                        </Link>
                        <Link href={`/${lang}/services/detailing-polishing`} className="block px-4 py-2 text-xs text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan">
                          {isRtl ? 'التلميع وتصحيح الطلاء والنانو' : 'Detailing & Multi-Stage Polishing'}
                        </Link>
                        <Link href={`/${lang}/services/window-tinting`} className="block px-4 py-2 text-xs text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan">
                          {isRtl ? 'تظليل السيارات والعازل الحراري' : 'Nanoceramic Window Tinting'}
                        </Link>
                        <Link href={`/${lang}/services/electrical`} className="block px-4 py-2 text-xs text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan">
                          {isRtl ? 'كهرباء وبرمجة وتشخيص السيارات' : 'Electrical Diagnostics & Repair'}
                        </Link>
                        <Link href={`/${lang}/services/mechanical`} className="block px-4 py-2 text-xs text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan">
                          {isRtl ? 'الصيانة الميكانيكية وتوضيب المحركات' : 'Mechanical Maintenance & Overhauls'}
                        </Link>
                        <Link href={`/${lang}/services/multimedia`} className="block px-4 py-2 text-xs text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan">
                          {isRtl ? 'أنظمة الصوت والشاشات الذكية' : 'Multimedia & Sound Systems'}
                        </Link>
                        <Link href={`/${lang}/services/denting-painting`} className="block px-4 py-2 text-xs text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan">
                          {isRtl ? 'السمكرة والدهان وإصلاح الصدمات' : 'Denting, Painting & Bodywork'}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-gray-300 hover:text-brand-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions: Language Switcher & WhatsApp CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <Link
              href={alternatePath}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-brand-cyan bg-brand-navy/60 border border-brand-steelBlue/40 rounded-md transition-colors"
              title={isRtl ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-brand-cyan" />
              <span>{isRtl ? 'English' : 'العربية'}</span>
            </Link>

            {/* WhatsApp CTA Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 transition-all rounded-md shadow-[0_0_15px_rgba(91,192,222,0.4)]"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>{dict.nav.callUs}</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href={alternatePath}
              className="px-2.5 py-1 text-xs font-semibold text-gray-300 bg-brand-navy/80 border border-brand-steelBlue/40 rounded"
            >
              {isRtl ? 'EN' : 'عربي'}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-deepNavy border-b border-brand-steelBlue/40 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-200 hover:text-brand-cyan border-b border-brand-steelBlue/20"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold uppercase text-brand-deepNavy bg-brand-cyan rounded-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{dict.nav.callUs} (0565694440)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
