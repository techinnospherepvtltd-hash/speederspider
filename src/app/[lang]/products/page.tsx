import React from 'react';
import { Metadata } from 'next';
import { dictionaries } from '@/lib/i18n/translations';
import { Language } from '@/types';
import { getProducts } from '@/lib/data/db';
import { ProductCatalogView } from '@/components/products/ProductCatalogView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductsPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';

  return {
    title: isRtl
      ? 'متجر وترقيات إلكترونيات وإكسسوارات السيارات | سبيدر سبايدر دبي'
      : 'Automotive Products, Multimedia Upgrades & Accessories | SpeederSpider Dubai',
    description: isRtl
      ? 'تصفح تشكيلة منتجات وإكسسوارات السيارات الفاخرة من سبيدر سبايدر دبي: صناديق Car Play، شاشات أندرويد لـ GMC وفورد ونيسان، أنظمة تتبع GSM، عازل حراري 3M، مصابيح LED وثلاجات السيارات.'
      : 'Explore SpeederSpider Dubai product catalogue: Apple CarPlay boxes, Android multimedia systems for GMC, Ford & Nissan, GSM vehicle tracking, 3M window tinting films, automotive LED lighting, and portable car fridges.',
    openGraph: {
      title: isRtl
        ? 'متجر وترقيات إلكترونيات وإكسسوارات السيارات | سبيدر سبايدر دبي'
        : 'Automotive Products, Multimedia Upgrades & Accessories | SpeederSpider Dubai',
      description: isRtl
        ? 'منتجات وإلكترونيات السيارات الفاخرة مع خدمة الاستفسار والتركيب الفوري عبر واتساب ورشة دبي.'
        : 'Premium automotive products, electronics, and accessories with direct WhatsApp inquiry and workshop installation in Dubai.',
    },
  };
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }];
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const dict = dictionaries[lang];

  const products = await getProducts();

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 inline-block">
          {dict.products.badge}
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white uppercase font-display tracking-tight leading-tight">
          {dict.products.title}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {dict.products.subtitle}
        </p>
      </div>

      {/* Interactive Product Catalog View with WhatsApp buttons */}
      <ProductCatalogView products={products} lang={lang} />
    </div>
  );
}
