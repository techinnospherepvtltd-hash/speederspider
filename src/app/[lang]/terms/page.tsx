import React from 'react';
import Link from 'next/link';
import { Language } from '@/types';
import { AlertCircle } from 'lucide-react';

interface TermsPageProps {
  params: Promise<{ lang: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { lang: paramLang } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Draft Review Notice */}
      <div className="flex items-center gap-3 p-4 bg-brand-amber/10 border border-brand-amber/40 rounded-xl text-brand-warmBeige text-xs">
        <AlertCircle className="w-5 h-5 shrink-0 text-brand-amber" />
        <span>
          {isRtl
            ? 'ملاحظة: هذا النص مسودة لشروط الخدمة مخصص للمراجعة القانونية من قبل إدارة سبيدر سبايدر.'
            : 'Note: This draft terms of service document is pending final legal review.'}
        </span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
        {isRtl ? 'شروط الخدمة' : 'Terms of Service'}
      </h1>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <p>
          {isRtl
            ? 'تنطبق هذه الشروط والأحكام على استخدام موقع سبيدر سبايدر وخدمات حجز الصيانة والاستشارات المقدمة.'
            : 'These terms apply to the use of the SpeederSpider website and consultation requests for workshop services in Dubai, UAE.'}
        </p>

        <h2 className="text-xl font-bold text-white font-display pt-4">
          {isRtl ? '1. عروض الأسعار والتقديرات الفنية' : '1. Quotations & Technical Estimates'}
        </h2>
        <p>
          {isRtl
            ? 'تعتبر كافة التقديرات المبدئية عبر الموقع أو واتساب تقديرية وتخضع للفحص الفني المباشر للسيارة داخل الورشة.'
            : 'All preliminary quotes provided online or via WhatsApp are non-binding estimates subject to physical in-person vehicle inspection inside our Dubai facility.'}
        </p>

        <h2 className="text-xl font-bold text-white font-display pt-4">
          {isRtl ? '2. حقوق الملكية الفكرية' : '2. Intellectual Property'}
        </h2>
        <p>
          {isRtl
            ? 'كافة الصور وتوثيق المشاريع والعلامة التجارية لسبيدر سبايدر محمية بموجب القوانين والأنظمة المعمول بها في دولة الإمارات.'
            : 'All photography, before/after documentation, graphics, and brand trademarks on this website belong to SpeederSpider.'}
        </p>
      </div>

      <div className="pt-8 border-t border-brand-steelBlue/30">
        <Link
          href={`/${lang}`}
          className="text-xs font-bold font-mono uppercase text-brand-cyan hover:underline"
        >
          ← {isRtl ? 'العودة للرئيسية' : 'Return to Home'}
        </Link>
      </div>
    </div>
  );
}
