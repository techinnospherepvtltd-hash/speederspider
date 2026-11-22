import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { getProjects } from '@/lib/data/db';
import { ArrowRight, ArrowLeft, Wrench } from 'lucide-react';

interface PortfolioPageProps {
  params: Promise<{ lang: string }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];
  const projects = await getProjects();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
          {dict.portfolio.badge}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white uppercase font-display">
          {dict.portfolio.title}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {dict.portfolio.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group rounded-2xl overflow-hidden bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/70 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-64 w-full overflow-hidden bg-brand-deepNavy">
              <Image
                src={project.after_image}
                alt={isRtl ? project.title_ar : project.title_en}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent" />
              {project.vehicle_make && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded bg-brand-deepNavy/80 backdrop-blur-sm border border-brand-steelBlue/50 text-[10px] font-mono uppercase text-brand-warmBeige">
                  {project.vehicle_make} {project.vehicle_model}
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white font-display group-hover:text-brand-cyan transition-colors">
                  {isRtl ? project.title_ar : project.title_en}
                </h2>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {isRtl ? project.desc_ar : project.desc_en}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-steelBlue/30 flex items-center justify-between">
                <span className="text-[11px] font-mono text-brand-cyan uppercase">
                  {isRtl ? 'تحول قبل وبعد' : 'Before / After'}
                </span>
                <Link
                  href={`/${lang}/our-work/${project.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-brand-cyan transition-colors"
                >
                  <span>{dict.portfolio.viewDetails}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
