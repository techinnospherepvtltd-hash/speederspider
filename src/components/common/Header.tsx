'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { WhatsAppIcon, CallingIcon } from '@/components/icons/SocialIcons';

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

  // Auto-close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات.")
      : encodeURIComponent("Hello SpeederSpider! I visited your website and would like to enquire about your automotive services.");
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  const navLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/services`, label: dict.nav.services, hasDropdown: true },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/our-work`, label: dict.nav.portfolio },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-deepNavy/90 backdrop-blur-md border-b border-brand-steelBlue/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-brand-navy border border-brand-cyan/40 p-1 group-hover:border-brand-cyan group-hover:shadow-[0_0_15px_rgba(91,192,222,0.4)] transition-all overflow-hidden shrink-0">
              <Image
                src="/images/speederspider-crest-car.webp"
                alt="SpeederSpider Brand Crest"
                width={44}
                height={44}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-widest text-white uppercase font-display leading-tight group-hover:text-brand-cyan transition-colors">
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

          {/* Right Actions: Phone Call, Language Switcher & WhatsApp CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Phone Call Link */}
            <a
              href="tel:+971565694440"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-brand-navy/60 hover:bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/60 rounded-md transition-all font-mono"
              title="Call SpeederSpider Workshop: +971 56 569 4440"
            >
              <CallingIcon className="w-3.5 h-3.5 text-brand-cyan" />
              <span>056 569 4440</span>
            </a>

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
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all rounded-md shadow-[0_0_15px_rgba(37,211,102,0.4)]"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
              <span>{isRtl ? 'واتساب' : 'WhatsApp'}</span>
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

      {/* Mobile Menu Overlay - positioned absolutely so it never shifts/pushes the page UI */}
      {mobileMenuOpen && (
        <>
          {/* Dimmed backdrop covering the screen below the header with blur */}
          <div
            className="md:hidden fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Floating dropdown overlay panel */}
          <div className="md:hidden absolute top-full left-0 right-0 w-full bg-brand-deepNavy/95 backdrop-blur-xl border-b border-brand-steelBlue/40 shadow-2xl z-50 px-6 py-6 space-y-4 animate-fadeInDown max-h-[calc(100vh-5rem)] overflow-y-auto">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 text-base font-medium text-gray-200 hover:text-brand-cyan border-b border-brand-steelBlue/20 transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="text-brand-cyan/60 text-xs font-mono">{isRtl ? '←' : '→'}</span>
                </Link>
              ))}
            </nav>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all rounded-lg shadow-[0_0_15px_rgba(37,211,102,0.3)]"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                <span>WhatsApp (0565694440)</span>
              </a>
              <a
                href="tel:+971565694440"
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-brand-navy hover:bg-brand-steelBlue/40 border border-brand-steelBlue/60 hover:border-brand-cyan transition-all rounded-lg"
              >
                <CallingIcon className="w-4 h-4 text-emerald-400 fill-current" />
                <span>{isRtl ? 'اتصال هاتف: 0565694440' : 'Call Us (0565694440)'}</span>
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
