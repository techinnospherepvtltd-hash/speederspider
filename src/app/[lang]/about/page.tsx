import React from 'react';
import Image from 'next/image';
import Link from 'next/image';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { Shield, Sparkles, Wrench, CheckCircle, Navigation } from 'lucide-react';

interface AboutPageProps {
  params: Promise<{ lang: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
          {isRtl ? 'عن سبيدر سبايدر' : 'ABOUT SPEEDERSPIDER'}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white uppercase font-display">
          {isRtl ? 'هندسة الحرفية وشغف السيارات' : 'Engineering Passion & Bespoke Craftsmanship'}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {isRtl
            ? 'مركز متخصص في دبي يجمع بين دقة المعايير الهندسية والحرفية اليدوية الراقية لتجديد وصيانة السيارات الفاخرة.'
            : 'A dedicated automotive atelier in Dubai founded on the principles of mechanical excellence, precision interior tailoring, and uncompromising service standards.'}
        </p>
      </div>

      {/* Workshop Visual Showcase */}
      <div className="relative h-[400px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-brand-steelBlue/40 shadow-2xl">
        <Image
          src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1800&q=85"
          alt="SpeederSpider Dubai Workshop Bay"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deepNavy via-brand-deepNavy/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-brand-deepNavy/80 backdrop-blur-md border border-brand-steelBlue/50">
          <div>
            <p className="text-xs font-mono uppercase text-brand-cyan">DUBAI WORKSHOP FACILITY</p>
            <p className="text-sm font-bold text-white font-display">Lat: 25.140658° N • Lng: 55.241515° E</p>
          </div>
          <span className="px-3 py-1 rounded bg-brand-navy border border-brand-steelBlue text-[11px] font-mono text-gray-300">
            {isRtl ? 'بيئة عمل بمعايير هندسية' : 'Climate Controlled bays'}
          </span>
        </div>
      </div>

      {/* Brand Philosophy & Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-deepNavy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            {isRtl ? 'حرفية يدوية مخصصة' : 'Artisanal Integrity'}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {isRtl
              ? 'نستخدم أجود أنواع جلد النابا والكانتارا لتعديل مقصورات السيارات مع المحافظة على معايير المصنع الأصلية.'
              : 'From diamond-quilted leather seats to custom steering wheel wraps, our interior artisans respect OEM tolerances while creating bespoke expressions.'}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-deepNavy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            {isRtl ? 'مقاومة مناخ الإمارات' : 'Engineered for the Gulf'}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {isRtl
              ? 'حلول عازل حراري نانو سيراميك وطبقات حماية طلاء مصممة خصيصاً لتحمل أشعة الشمس وحرارة الصيف القاسية في دبي.'
              : 'Every coating formula, window film, and interior adhesive we utilize is specifically chosen to endure Dubai extreme summer temperatures and fine airborne dust.'}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-deepNavy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            {isRtl ? 'شفافية ودقة هندسية' : 'Diagnostic Precision'}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {isRtl
              ? 'أجهزة تشخيص متقدمة لفحص الأنظمة الكهربائية والميكانيكية للسيارات الأوروبية والأمريكية دون تخمين.'
              : 'We operate with computerized diagnostics and auditable inventory management, ensuring transparency in every component and labor hour.'}
          </p>
        </div>
      </div>
    </div>
  );
}
