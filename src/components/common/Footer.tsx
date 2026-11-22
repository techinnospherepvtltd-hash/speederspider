import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { MapPin, Phone, MessageSquare, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { GoogleReviewButton } from '@/components/common/GoogleReviewButton';

interface FooterProps {
  lang: Language;
  googleReviewUrl?: string | null;
}

export function Footer({ lang, googleReviewUrl }: FooterProps) {
  const dict = dictionaries[lang];
  const isRtl = lang === 'ar';
  const officialAddress = isRtl
    ? "شارع الأصايل - القوز الصناعية الثانية - القوز - دبي"
    : "Al Asayel St - Al Qouz Ind. Second - Al Quoz - Dubai";

  const services = [
    { slug: 'upholstery', title: isRtl ? 'تنجيد السيارات الفاخرة' : 'Custom Upholstery' },
    { slug: 'detailing-polishing', title: isRtl ? 'التلميع وتصحيح الطلاء والنانو' : 'Detailing & Polishing' },
    { slug: 'window-tinting', title: isRtl ? 'تظليل السيارات والعازل الحراري' : 'Nanoceramic Window Tinting' },
    { slug: 'electrical', title: isRtl ? 'كهرباء وفحص كمبيوتر السيارات' : 'Electrical Diagnostics' },
    { slug: 'mechanical', title: isRtl ? 'الصيانة الميكانيكية وتوضيب المحركات' : 'Mechanical Maintenance' },
    { slug: 'multimedia', title: isRtl ? 'أنظمة الصوت والشاشات الذكية' : 'Multimedia & Apple CarPlay' },
    { slug: 'denting-painting', title: isRtl ? 'السمكرة والدهان وأفران الرش' : 'Denting, Painting & Bodywork' },
  ];

  return (
    <footer className="w-full bg-brand-deepNavy border-t border-brand-steelBlue/30 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href={`/${lang}`} className="inline-block group">
              <div className="relative w-48 sm:w-56 h-auto mb-1">
                <Image
                  src="/images/speederspider-shield-full.webp"
                  alt="SpeederSpider Dubai - Drive Beyond Ordinary"
                  width={240}
                  height={172}
                  className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_20px_rgba(91,192,222,0.3)]"
                />
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {dict.footer.tagline}
            </p>

            {/* Google Review CTA Button */}
            <div className="pt-2">
              <GoogleReviewButton lang={lang} reviewUrl={googleReviewUrl} />
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://www.instagram.com/dsusvip?bqrl=MWw5YnQ5YmdqYWowbg=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-md bg-brand-navy border border-brand-steelBlue/40 text-gray-300 hover:text-brand-amber hover:border-brand-amber transition-colors"
                title="SpeederSpider Instagram"
              >
                <span className="text-xs font-bold font-mono">IG</span>
              </a>
              <a
                href="https://www.facebook.com/share/1EFvDZmQN6/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-md bg-brand-navy border border-brand-steelBlue/40 text-gray-300 hover:text-brand-cyan hover:border-brand-cyan transition-colors"
                title="SpeederSpider Facebook"
              >
                <span className="text-xs font-bold font-mono">FB</span>
              </a>
              <a
                href="https://wa.me/971565694440"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-md bg-brand-navy border border-brand-steelBlue/40 text-gray-300 hover:text-emerald-400 hover:border-emerald-400 transition-colors"
                title="WhatsApp Direct"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-mono mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              {dict.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href={`/${lang}`} className="hover:text-brand-cyan transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="hover:text-brand-cyan transition-colors">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/services`} className="hover:text-brand-cyan transition-colors">
                  {dict.nav.services}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/our-work`} className="hover:text-brand-cyan transition-colors">
                  {dict.nav.portfolio}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-brand-cyan transition-colors">
                  {dict.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* 7 Services Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-mono mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
              {dict.footer.servicesList}
            </h3>
            <ul className="space-y-2.5 text-xs">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${lang}/services/${s.slug}`}
                    className="hover:text-brand-cyan transition-colors flex items-center justify-between group"
                  >
                    <span>{s.title}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:text-brand-amber transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Workshop Contact & Official Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-mono mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              {dict.footer.contactInfo}
            </h3>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">{officialAddress}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Al Quoz Industrial Area 2, Dubai, UAE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm pt-2">
              <Phone className="w-5 h-5 text-brand-cyan shrink-0" />
              <a href="tel:+971565694440" className="hover:text-brand-cyan transition-colors font-mono">
                +971 56 569 4440
              </a>
            </div>

            <div className="pt-4">
              <a
                href="https://wa.me/971565694440"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded hover:bg-brand-cyan/90 transition-all shadow-[0_0_12px_rgba(91,192,222,0.3)]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp: 0565694440</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Portal */}
        <div className="mt-12 pt-8 border-t border-brand-steelBlue/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SpeederSpider. {dict.footer.rights}</p>
          <div className="flex items-center gap-6">
            <Link href={`/${lang}/privacy-policy`} className="hover:text-gray-400 transition-colors">
              {dict.footer.privacyPolicy}
            </Link>
            <Link href={`/${lang}/terms`} className="hover:text-gray-400 transition-colors">
              {dict.footer.termsOfService}
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-gray-400 hover:text-brand-amber transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-brand-amber" />
              <span>{dict.footer.adminPortal}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
