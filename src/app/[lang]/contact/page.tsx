import React from 'react';
import type { Metadata } from 'next';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { getServices, getGoogleReviewSettings } from '@/lib/data/db';
import { ContactForm } from '@/components/forms/ContactForm';
import { WorkshopMap } from '@/components/automotive/WorkshopMap';
import { GoogleReviewButton } from '@/components/common/GoogleReviewButton';
import { MapPin, Clock } from 'lucide-react';
import { WhatsAppIcon, CallingIcon } from '@/components/icons/SocialIcons';

interface ContactPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { lang } = await params;
  const isRtl = lang === 'ar';
  return {
    title: isRtl
      ? 'اتصل بنا | ورشة سبيدر سبايدر دبي - شارع الأصايل القوز'
      : 'Contact Us | SpeederSpider Dubai Workshop - Al Asayel St Al Quoz',
    description: isRtl
      ? 'تواصل مع ورشة سبيدر سبايدر في دبي (شارع الأصايل - القوز الصناعية 2) لحجز موعد استشارة لصيانة، تلميع، وتعديل السيارات. واتساب: 0565694440.'
      : 'Contact SpeederSpider Dubai at Al Asayel St, Al Quoz Industrial 2, for luxury automotive repair, detailing, tinting, and upholstery. WhatsApp: 0565694440.',
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];
  const services = await getServices();
  const googleSettings = await getGoogleReviewSettings();
  const googleReviewUrl = googleSettings?.is_enabled && googleSettings.url ? googleSettings.url : null;

  const officialAddress = isRtl
    ? "شارع الأصايل - القوز الصناعية الثانية - القوز - دبي"
    : "Al Asayel St - Al Qouz Ind. Second - Al Quoz - Dubai";

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات.")
      : encodeURIComponent("Hello SpeederSpider! I visited your website and would like to enquire about your automotive services.");
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-amber flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
          {dict.contact.badge}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white uppercase font-display">
          {dict.contact.title}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {dict.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Direct Workshop Details */}
        <div className="space-y-8 p-8 rounded-2xl bg-brand-navy border border-brand-steelBlue/40">
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              {dict.contact.directContactBadge}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? 'قنوات الاتصال المباشرة مع المشرف الفني.' : 'Direct lines to our Dubai workshop supervisors.'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-brand-deepNavy border border-brand-amber/40 text-brand-amber shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono text-gray-400">
                  {isRtl ? 'العنوان الرسمي' : 'Official Workshop Address'}
                </p>
                <p className="text-sm font-semibold text-white mt-0.5 leading-snug">
                  {officialAddress}
                </p>
                <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                  Al Quoz Industrial Area 2, Dubai, UAE
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-brand-deepNavy border border-[#25D366]/40 text-[#25D366] shrink-0">
                <WhatsAppIcon className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono text-gray-400">WhatsApp</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:text-[#25D366] transition-colors font-mono"
                >
                  0565694440
                </a>
              </div>
            </div>

            {/* Telephone */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-brand-deepNavy border border-emerald-500/40 text-emerald-400 shrink-0">
                <CallingIcon className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono text-gray-400">Telephone / Calling</p>
                <a
                  href="tel:+971565694440"
                  className="text-sm font-bold text-white hover:text-emerald-400 transition-colors font-mono"
                >
                  +971 56 569 4440
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-brand-deepNavy border border-brand-cyan/40 text-brand-cyan shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono text-gray-400">Hours</p>
                <p className="text-xs text-white">Sat - Thu: 9:00 AM - 8:00 PM</p>
                <p className="text-[11px] text-gray-400">Friday: By Appointment</p>
              </div>
            </div>
          </div>

          {/* Rate Us on Google Button */}
          <div className="pt-4 border-t border-brand-steelBlue/30">
            <GoogleReviewButton lang={lang} reviewUrl={googleReviewUrl} className="w-full justify-center" />
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-2">
          <ContactForm lang={lang} services={services} />
        </div>
      </div>

      {/* Map Section */}
      <div className="pt-8">
        <WorkshopMap lang={lang} googleReviewUrl={googleReviewUrl} />
      </div>
    </div>
  );
}
