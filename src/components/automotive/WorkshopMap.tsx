'use client';

import React from 'react';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { GoogleReviewButton } from '@/components/common/GoogleReviewButton';

interface WorkshopMapProps {
  lang: 'en' | 'ar';
  googleReviewUrl?: string | null;
}

export function WorkshopMap({ lang, googleReviewUrl }: WorkshopMapProps) {
  const isRtl = lang === 'ar';
  const officialAddressEn = "Al Asayel St - Al Qouz Ind. Second - Al Quoz - Dubai";
  const officialAddressAr = "شارع الأصايل - القوز الصناعية الثانية - القوز - دبي";
  const address = isRtl ? officialAddressAr : officialAddressEn;

  // Google Maps navigation link based on the official address
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=Al+Asayel+St+-+Al+Qouz+Ind.+Second+-+Al+Quoz+-+Dubai`;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-brand-steelBlue/40 bg-brand-navy shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Map Interactive Embed Frame */}
        <div className="lg:col-span-2 relative min-h-[350px] sm:min-h-[420px] bg-brand-deepNavy">
          <iframe
            title="SpeederSpider Dubai Workshop Location"
            src={`https://maps.google.com/maps?q=Al+Asayel+St+-+Al+Qouz+Ind.+Second+-+Al+Quoz+-+Dubai&hl=${lang}&z=14&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full min-h-[350px] grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          />
        </div>

        {/* Location Details Card */}
        <div className="p-8 flex flex-col justify-between bg-gradient-to-br from-brand-navy via-brand-navy to-brand-deepNavy border-t lg:border-t-0 lg:border-l border-brand-steelBlue/30">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-amber flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-amber animate-pulse" />
                {isRtl ? 'الموقع الرسمي للورشة' : 'OFFICIAL WORKSHOP LOCATION'}
              </span>
              <h3 className="text-2xl font-bold text-white mt-1.5 font-display">
                SpeederSpider Dubai
              </h3>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                {isRtl
                  ? 'مركز متخصص في صيانة، تلميع، وتعديل السيارات الفاخرة في دبي.'
                  : 'Premier atelier for bespoke upholstery, detailing, electrical, and performance tuning in Dubai.'}
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Official Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-mono">
                    {isRtl ? 'العنوان' : 'Address'}
                  </p>
                  <p className="text-sm font-semibold text-white leading-snug mt-0.5">
                    {address}
                  </p>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                    Al Quoz Industrial Area 2, Dubai, UAE
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-mono">
                    {isRtl ? 'ساعات العمل' : 'Working Hours'}
                  </p>
                  <p className="text-sm text-white">
                    {isRtl ? 'السبت - الخميس: 9:00 ص - 8:00 م' : 'Saturday – Thursday: 9:00 AM – 8:00 PM'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isRtl ? 'الجمعة: مواعيد مسبقة' : 'Friday: By Appointment'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-mono">
                    {isRtl ? 'الاتصال المباشر' : 'Direct Line'}
                  </p>
                  <a href="tel:+971565694440" className="text-sm font-mono text-brand-cyan hover:underline">
                    +971 56 569 4440
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all shadow-[0_0_15px_rgba(91,192,222,0.3)]"
            >
              <Navigation className="w-4 h-4" />
              <span>{isRtl ? 'فتح في خرائط جوجل' : 'Navigate via Google Maps'}</span>
            </a>

            <div className="text-center">
              <GoogleReviewButton lang={lang} reviewUrl={googleReviewUrl} variant="outline" className="w-full justify-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
