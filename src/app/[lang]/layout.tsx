import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { AutomotivePreloader } from '@/components/automotive/AutomotivePreloader';

interface BilingualLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isRtl = lang === 'ar';

  const title = isRtl
    ? 'سبيدر سبايدر | تنجيد، تلميع، صيانة وتعديل السيارات الفاخرة دبي'
    : 'SpeederSpider | Automotive Repair, Detailing & Bespoke Customization Dubai';

  const description = isRtl
    ? 'مركز سبيدر سبايدر في دبي لصيانة وتعديل السيارات. تنجيد جلد طبيعي، نانو سيراميك، عازل حراري، فحص وبرمجة كمبيوتر، صيانة ميكانيكية وسمكرة ودهان.'
    : 'Dubai premier automotive atelier. Bespoke leather upholstery, nanoceramic detailing, window tinting, electrical diagnostics, mechanical overhauls, and bodywork.';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://speederspider.com';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: {
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`,
        'x-default': `${siteUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}`,
      siteName: 'SpeederSpider Dubai',
      locale: isRtl ? 'ar_AE' : 'en_AE',
      type: 'website',
    },
  };
}

export default async function BilingualLayout({
  children,
  params,
}: BilingualLayoutProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;

  if (paramLang !== 'en' && paramLang !== 'ar') {
    notFound();
  }

  const isRtl = lang === 'ar';

  return (
    <div lang={lang} dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col min-h-screen">
      {/* Automotive-themed preloader */}
      <AutomotivePreloader lang={lang} />

      {/* Primary Navigation */}
      <Header lang={lang} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Workshop Footer */}
      <Footer lang={lang} />

      {/* WhatsApp Quick Action Button */}
      <WhatsAppButton lang={lang} />
    </div>
  );
}
