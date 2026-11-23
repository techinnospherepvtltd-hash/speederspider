import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { getServices } from '@/lib/data/db';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import { ArrowRight, ArrowLeft, Sparkles, Shield, Sun, Zap, Cpu, Radio, Wrench } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ServicesOverviewPageProps {
  params: Promise<{ lang: string }>;
}

export default async function ServicesOverviewPage({ params }: ServicesOverviewPageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];
  const services = await getServices();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-brand-cyan" />;
      case 'Shield': return <Shield className="w-6 h-6 text-brand-cyan" />;
      case 'Sun': return <Sun className="w-6 h-6 text-brand-cyan" />;
      case 'Zap': return <Zap className="w-6 h-6 text-brand-cyan" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-brand-cyan" />;
      case 'Radio': return <Radio className="w-6 h-6 text-brand-cyan" />;
      default: return <Wrench className="w-6 h-6 text-brand-cyan" />;
    }
  };

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
          {dict.services.badge}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white uppercase font-display">
          {dict.services.title}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {dict.services.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const featuredImg = normalizeGoogleDriveUrl(service.featured_image) || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80';
          const isGoogle = featuredImg.includes('google') || featuredImg.includes('lh3');

          return (
            <div
              key={service.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/70 transition-all duration-300 hover:shadow-[0_0_30px_rgba(91,192,222,0.15)]"
            >
              <div className="relative h-56 w-full overflow-hidden bg-brand-deepNavy">
                <Image
                  src={featuredImg}
                  alt={isRtl ? service.title_ar : service.title_en}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  unoptimized={isGoogle}
                  priority={index < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
                <div className="absolute top-4 left-4 p-2.5 rounded-lg bg-brand-deepNavy/80 backdrop-blur-md border border-brand-steelBlue/50">
                  {getServiceIcon(service.icon_name)}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-display group-hover:text-brand-cyan transition-colors">
                    {isRtl ? service.title_ar : service.title_en}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    {isRtl ? service.short_desc_ar : service.short_desc_en}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-steelBlue/30 flex items-center justify-between">
                  <Link
                    href={`/${lang}/services/${isRtl ? service.slug_ar : service.slug_en}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:text-white transition-colors"
                  >
                    <span>{dict.services.exploreBtn}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
