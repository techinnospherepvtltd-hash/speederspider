import React from 'react';
import type { Metadata } from 'next';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { getServices } from '@/lib/data/db';
import { ContactForm } from '@/components/forms/ContactForm';
import { WorkshopMap } from '@/components/automotive/WorkshopMap';
import { MapPin, Phone, MessageSquare, Clock } from 'lucide-react';

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
      ? 'اتصل بنا | ورشة سبيدر سبايدر دبي'
      : 'Contact Us | SpeederSpider Dubai Workshop',
    description: isRtl
      ? 'تواصل مع ورشة سبيدر سبايدر في دبي لحجز موعد استشارة لصيانة، تلميع، وتعديل السيارات. واتساب: 0565694440.'
      : 'Contact SpeederSpider Dubai for luxury automotive repair, detailing, tinting, and upholstery consultation. WhatsApp: 0565694440.',
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];
  const services = await getServices();

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات.")
      : encodeURIComponent("Hello SpeederSpider! I visited your website and would like to enquire about your automotive services.");
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
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
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-brand-deepNavy border border-brand-cyan/40 text-brand-cyan shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono text-gray-400">WhatsApp</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:text-brand-cyan transition-colors font-mono"
                >
                  0565694440
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-brand-deepNavy border border-brand-cyan/40 text-brand-cyan shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono text-gray-400">Telephone</p>
                <a
                  href="tel:+971565694440"
                  className="text-sm font-bold text-white hover:text-brand-cyan transition-colors font-mono"
                >
                  +971 56 569 4440
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-brand-deepNavy border border-brand-cyan/40 text-brand-cyan shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono text-gray-400">Location</p>
                <p className="text-sm text-white">Dubai, United Arab Emirates</p>
                <p className="text-[11px] font-mono text-brand-warmBeige mt-0.5">
                  25.140658° N, 55.241515° E
                </p>
              </div>
            </div>

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
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-2">
          <ContactForm lang={lang} services={services} />
        </div>
      </div>

      {/* Map Section */}
      <div className="pt-8">
        <WorkshopMap lang={lang} />
      </div>
    </div>
  );
}
