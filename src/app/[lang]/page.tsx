import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { getServices, getFeaturedProjects, getTestimonials, getGoogleReviewSettings } from '@/lib/data/db';
import { BeforeAfterSlider } from '@/components/automotive/BeforeAfterSlider';
import { WorkshopMap } from '@/components/automotive/WorkshopMap';
import { GoogleReviewButton } from '@/components/common/GoogleReviewButton';
import { CinematicHero } from '@/components/home/CinematicHero';
import { ArrowRight, ArrowLeft, Shield, Sparkles, Sun, Zap, Cpu, Radio, Wrench, MessageSquare, CheckCircle, Star } from 'lucide-react';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const dict = dictionaries[lang];

  const services = await getServices();
  const featuredProjects = await getFeaturedProjects();
  const testimonials = await getTestimonials();
  const googleReviewSettings = await getGoogleReviewSettings();
  const googleReviewUrl = googleReviewSettings.url || '';

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! أود الاستفسار عن خدمات صيانة وتعديل السيارات لديكم.")
      : encodeURIComponent("Hello SpeederSpider! I would like to enquire about your automotive services.");
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  // Icon mapping helper
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

  // Structured Data (JSON-LD) for LocalBusiness / AutoRepair
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'SpeederSpider',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    telephone: '+971565694440',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.140657502467402,
      longitude: 55.24151547185268,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Al Asayel St - Al Qouz Ind. Second',
      addressLocality: 'Al Quoz, Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    sameAs: [
      'https://www.facebook.com/share/1EFvDZmQN6/',
      'https://www.instagram.com/dsusvip?bqrl=MWw5YnQ5YmdqYWowbg==',
    ],
  };

  return (
    <div className="flex flex-col w-full">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. CINEMATIC HERO SECTION (EDITORIAL CAMPAIGN COMPOSITION) */}
      <CinematicHero lang={lang} dict={dict} whatsappUrl={whatsappUrl} />

      {/* 1B. WORKSHOP TELEMETRY METRIC STRIP */}
      <section className="bg-[#070C1E] border-y border-brand-steelBlue/30 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 rounded-xl bg-brand-deepNavy/70 border border-brand-steelBlue/30 hover:border-brand-cyan/40 transition-colors flex items-center justify-between">
            <div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-brand-cyan">{dict.hero.stat1Value}</p>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-mono mt-0.5">{dict.hero.stat1Label}</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan/70 animate-pulse" />
          </div>

          <div className="p-4 rounded-xl bg-brand-deepNavy/70 border border-brand-steelBlue/30 hover:border-brand-amber/40 transition-colors flex items-center justify-between">
            <div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-brand-amber">{dict.hero.stat2Value}</p>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-mono mt-0.5">{dict.hero.stat2Label}</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-amber/80 animate-pulse shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
          </div>

          <div className="p-4 rounded-xl bg-brand-deepNavy/70 border border-brand-steelBlue/30 hover:border-emerald-400/40 transition-colors flex items-center justify-between">
            <div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-white">{dict.hero.stat3Value}</p>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-mono mt-0.5">{dict.hero.stat3Label}</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
        </div>
      </section>

      {/* 2. SERVICES OVERVIEW (7 CORE DISCIPLINES) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-deepNavy border-t border-brand-steelBlue/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
              {dict.services.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
              {dict.services.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {dict.services.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700'];
              return (
                <div
                  key={service.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-navy/80 border border-brand-steelBlue/40 hover:border-brand-cyan/70 transition-all duration-300 hover:shadow-[0_0_30px_rgba(91,192,222,0.15)] animate-scaleReveal ${delays[index % delays.length]} gpu-render`}
                >
                  {/* Service Card Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-brand-deepNavy">
                    <Image
                      src={service.featured_image}
                      alt={isRtl ? service.title_ar : service.title_en}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
                    <div className="absolute top-4 left-4 p-2.5 rounded-lg bg-brand-deepNavy/80 backdrop-blur-md border border-brand-steelBlue/50">
                      {getServiceIcon(service.icon_name)}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white font-display group-hover:text-brand-cyan transition-colors">
                        {isRtl ? service.title_ar : service.title_en}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-3 leading-relaxed">
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

          <div className="text-center pt-6">
            <Link
              href={`/${lang}/services`}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-brand-navy border border-brand-steelBlue hover:border-brand-cyan rounded-lg transition-colors"
            >
              <span>{dict.services.viewAll}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE BEFORE-AND-AFTER IMAGE COMPARISON */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-deepNavy via-brand-navy to-brand-deepNavy border-t border-brand-steelBlue/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
              {dict.beforeAfter.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
              {dict.beforeAfter.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {dict.beforeAfter.subtitle}
            </p>
          </div>

          {/* Interactive Before & After Slider Component */}
          <div className="max-w-4xl mx-auto">
            <BeforeAfterSlider
              beforeImage="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"
              afterImage="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80"
              beforeLabel={dict.beforeAfter.beforeLabel}
              afterLabel={dict.beforeAfter.afterLabel}
              beforeAlt="Porsche 911 GT3 paint prior to multi-stage paint correction"
              afterAlt="Porsche 911 GT3 paint following multi-stage paint correction and 9H ceramic coating"
              aspectRatio="16/9"
            />
            <p className="text-center text-xs font-mono uppercase tracking-wider text-gray-500 mt-4">
              {dict.beforeAfter.instructions}
            </p>
          </div>
        </div>
      </section>

      {/* 4. SELECTED COMPLETED PROJECTS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-deepNavy border-t border-brand-steelBlue/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
                {dict.portfolio.badge}
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
                {dict.portfolio.title}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                {dict.portfolio.subtitle}
              </p>
            </div>
            <Link
              href={`/${lang}/our-work`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:text-white transition-colors"
            >
              <span>{isRtl ? 'عرض كافة المشاريع' : 'Explore All Showcase Projects'}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-2xl overflow-hidden bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/70 transition-all duration-300"
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

                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-white font-display group-hover:text-brand-cyan transition-colors">
                    {isRtl ? project.title_ar : project.title_en}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {isRtl ? project.desc_ar : project.desc_en}
                  </p>
                  <div className="pt-3 border-t border-brand-steelBlue/30 flex items-center justify-between text-xs">
                    <span className="font-mono text-brand-cyan uppercase text-[11px]">
                      {isRtl ? 'مشروع موثق' : 'VERIFIED CRAFTSMANSHIP'}
                    </span>
                    <Link
                      href={`/${lang}/our-work/${project.slug}`}
                      className="text-gray-300 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <span>{dict.portfolio.viewDetails}</span>
                      <ArrowIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE SPEEDERSPIDER */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-navy border-t border-brand-steelBlue/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
              {dict.whyUs.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
              {dict.whyUs.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {dict.whyUs.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-brand-deepNavy border border-brand-steelBlue/40 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">{dict.whyUs.point1Title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{dict.whyUs.point1Desc}</p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-deepNavy border border-brand-steelBlue/40 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">{dict.whyUs.point2Title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{dict.whyUs.point2Desc}</p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-deepNavy border border-brand-steelBlue/40 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">{dict.whyUs.point3Title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{dict.whyUs.point3Desc}</p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-deepNavy border border-brand-steelBlue/40 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">{dict.whyUs.point4Title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{dict.whyUs.point4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-deepNavy border-t border-brand-steelBlue/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
              {dict.testimonials.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
              {dict.testimonials.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {dict.testimonials.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-8 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-brand-amber">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 italic leading-relaxed">
                    &ldquo;{isRtl ? t.review_ar : t.review_en}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-steelBlue/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">
                      {isRtl ? t.client_name_ar : t.client_name_en}
                    </h4>
                    {t.vehicle_info && (
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        {t.vehicle_info}
                      </p>
                    )}
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Rate Us on Google Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-navy via-brand-deepNavy to-brand-navy border border-brand-steelBlue/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-brand-amber">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="text-xs font-mono font-bold text-white ml-2">
                  {isRtl ? 'تقييمات عملاء حقيقية' : 'Verified Google Reviews'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                {isRtl
                  ? 'شاركنا تجربتك في ورشة سبيدر سبايدر لمساعدتنا في الحفاظ على أعلى معايير الجودة.'
                  : 'Experienced our automotive craftsmanship? Share your review on Google to help fellow enthusiasts.'}
              </p>
            </div>

            <GoogleReviewButton
              reviewUrl={googleReviewUrl}
              lang={lang}
              className="shadow-[0_0_20px_rgba(217,119,6,0.25)] shrink-0"
            />
          </div>
        </div>
      </section>

      {/* 7. WORKSHOP & GPS LOCATION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-navy border-t border-brand-steelBlue/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan">
              {dict.location.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
              {dict.location.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {dict.location.subtitle}
            </p>
          </div>

          <WorkshopMap lang={lang} />
        </div>
      </section>

      {/* 8. FAST CONSULTATION CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-deepNavy via-brand-navy to-brand-deepNavy border-t border-brand-steelBlue/30">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
            {isRtl ? 'جاهز لترقية أو صيانة سيارتك؟' : 'Ready to Elevate Your Automotive Experience?'}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            {isRtl
              ? 'تحدث مباشرة مع فريق ورشة سبيدر سبايدر في دبي لمناقشة متطلبات سيارتك وحجز موعد استشارة فنية.'
              : 'Speak directly with our Dubai workshop specialists to discuss your vehicle requirements or schedule a technical inspection.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all shadow-[0_0_20px_rgba(91,192,222,0.4)]"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>{isRtl ? 'محادثة عبر واتساب (0565694440)' : 'WhatsApp Direct (0565694440)'}</span>
            </a>

            <Link
              href={`/${lang}/contact`}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-bold uppercase tracking-wider text-white bg-brand-deepNavy hover:bg-brand-deepNavy/80 border border-brand-steelBlue/60 rounded-lg transition-all"
            >
              <span>{dict.nav.contact}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
