import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceBySlug } from '@/lib/data/db';
import { Language } from '@/types';
import { dictionaries } from '@/lib/i18n/translations';
import { BeforeAfterSlider } from '@/components/automotive/BeforeAfterSlider';
import { MessageSquare, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';

interface ServiceDetailPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: 'Service Not Found | SpeederSpider' };
  }

  const isRtl = lang === 'ar';
  const title = isRtl
    ? (service.seo_title_ar || `${service.title_ar} في دبي | سبيدر سبايدر`)
    : (service.seo_title_en || `${service.title_en} Dubai | SpeederSpider`);
  const description = isRtl
    ? (service.seo_desc_ar || service.short_desc_ar)
    : (service.seo_desc_en || service.short_desc_en);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://speederspider.com';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/services/${slug}`,
      languages: {
        en: `${siteUrl}/en/services/${service.slug_en}`,
        ar: `${siteUrl}/ar/services/${service.slug_ar}`,
        'x-default': `${siteUrl}/en/services/${service.slug_en}`,
      },
    },
    openGraph: {
      title,
      description,
      images: [{ url: service.featured_image }],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { lang: paramLang, slug } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent(`مرحباً SpeederSpider! أود الاستفسار عن خدمة: ${service.title_ar}`)
      : encodeURIComponent(`Hello SpeederSpider! I would like to enquire about your service: ${service.title_en}`);
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  // Structured Data (JSON-LD) for Service with official address
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: isRtl ? service.title_ar : service.title_en,
    description: isRtl ? service.description_ar : service.description_en,
    provider: {
      '@type': 'AutoRepair',
      name: 'SpeederSpider',
      telephone: '+971565694440',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Al Asayel St - Al Qouz Ind. Second - Al Quoz',
        addressLocality: 'Dubai',
        addressCountry: 'AE',
      },
    },
    areaServed: {
      '@type': 'City',
      name: 'Dubai',
    },
  };

  // Dedicated Before and After images for this service
  const beforeImage = service.before_image || service.featured_image;
  const afterImage = service.after_image || service.featured_image;
  const beforeCaption = isRtl
    ? (service.before_caption_ar || "الحالة قبل بدء العمل الفني")
    : (service.before_caption_en || "Condition before service execution");
  const afterCaption = isRtl
    ? (service.after_caption_ar || "النتيجة النهائية بعد اكتمال الخدمة")
    : (service.after_caption_en || "Completed transformation result");
  const beforeAlt = isRtl ? (service.before_alt_ar || service.title_ar) : (service.before_alt_en || service.title_en);
  const afterAlt = isRtl ? (service.after_alt_ar || service.title_ar) : (service.after_alt_en || service.title_en);

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400">
        <Link href={`/${lang}`} className="hover:text-brand-cyan transition-colors">
          {isRtl ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <Link href={`/${lang}/services`} className="hover:text-brand-cyan transition-colors">
          {isRtl ? 'الخدمات' : 'Services'}
        </Link>
        <span>/</span>
        <span className="text-brand-cyan font-bold truncate">
          {isRtl ? service.title_ar : service.title_en}
        </span>
      </nav>

      {/* Hero Service Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy border border-brand-amber/40 text-brand-amber text-xs font-mono uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-amber" />
            <span>{isRtl ? 'تخصص سيارات فاخرة' : 'SPECIALIZED AUTOMOTIVE DISCIPLINE'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display leading-tight">
            {isRtl ? service.title_ar : service.title_en}
          </h1>

          <p className="text-gray-300 text-base leading-relaxed">
            {isRtl ? service.description_ar : service.description_en}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all shadow-[0_0_20px_rgba(91,192,222,0.4)]"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>{isRtl ? 'حجز موعد عبر واتساب' : 'Book on WhatsApp (0565694440)'}</span>
            </a>

            <Link
              href={`/${lang}/contact`}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-brand-navy hover:bg-brand-steelBlue/40 border border-brand-steelBlue hover:border-brand-amber rounded-lg transition-all"
            >
              <span>{isRtl ? 'طلب تسعيرة مفصلة' : 'Request Official Quote'}</span>
            </Link>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-brand-steelBlue/40 shadow-2xl group">
          <Image
            src={service.featured_image}
            alt={isRtl ? service.title_ar : service.title_en}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deepNavy via-transparent to-transparent opacity-60" />
        </div>
      </div>

      {/* DEDICATED BEFORE & AFTER COMPARISON SECTION */}
      <section className="py-12 px-6 sm:px-10 rounded-3xl bg-gradient-to-b from-brand-navy/90 to-brand-deepNavy border border-brand-steelBlue/40 space-y-8 shadow-2xl">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-deepNavy border border-brand-cyan/40 text-brand-cyan text-xs font-mono uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{dict.services.beforeAfterBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase font-display">
            {dict.services.beforeAfterTitle}: {isRtl ? service.title_ar : service.title_en}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {dict.services.beforeAfterSubtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          <BeforeAfterSlider
            beforeImage={beforeImage}
            afterImage={afterImage}
            beforeLabel={dict.beforeAfter.beforeLabel}
            afterLabel={dict.beforeAfter.afterLabel}
            beforeAlt={beforeAlt}
            afterAlt={afterAlt}
            aspectRatio="16/9"
          />

          {/* Captions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono p-4 rounded-xl bg-brand-deepNavy/80 border border-brand-steelBlue/30">
            <div className="space-y-1">
              <span className="text-brand-amber font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-amber" />
                {dict.beforeAfter.beforeLabel}:
              </span>
              <p className="text-gray-300 leading-relaxed font-sans">{beforeCaption}</p>
            </div>
            <div className="space-y-1">
              <span className="text-brand-cyan font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                {dict.beforeAfter.afterLabel}:
              </span>
              <p className="text-gray-300 leading-relaxed font-sans">{afterCaption}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Standards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-brand-steelBlue/30">
        <div className="p-6 rounded-xl bg-brand-navy/60 border border-brand-steelBlue/30 flex items-start gap-4 hover:border-brand-cyan/50 transition-colors">
          <CheckCircle2 className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white font-display">
              {isRtl ? 'معايير المصنع الأصلية OEM' : 'OEM-Grade Standards'}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? 'استخدام مواد معتمدة تتوافق مع أدق مواصفات الشركات المصنعة.' : 'Every material and part meets or exceeds original automotive specifications.'}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-brand-navy/60 border border-brand-steelBlue/30 flex items-start gap-4 hover:border-brand-amber/50 transition-colors">
          <CheckCircle2 className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white font-display">
              {isRtl ? 'اختبارات مناخ الخليج' : 'Dubai Climate Engineered'}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? 'مقاومة معتمدة ضد درجات الحرارة المرتفعة والأشعة فوق البنفسجية.' : 'Tested for high infrared heat reflection and desert atmospheric conditions.'}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-brand-navy/60 border border-brand-steelBlue/30 flex items-start gap-4 hover:border-brand-cyan/50 transition-colors">
          <CheckCircle2 className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white font-display">
              {isRtl ? 'إشراف فني متخصص' : 'Specialist Workmanship'}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? 'تنفيذ دقيق بأيدي فنيين متمرسين في ورشة دبي (شارع الأصايل - القوز).' : 'Executed directly inside our dedicated Dubai workshop on Al Asayel St, Al Quoz.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
