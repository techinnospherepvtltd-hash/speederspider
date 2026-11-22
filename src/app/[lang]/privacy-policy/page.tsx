import React from 'react';
import Link from 'next/link';
import { Language } from '@/types';
import { AlertCircle } from 'lucide-react';

interface PrivacyPageProps {
  params: Promise<{ lang: string }>;
}

export default async function PrivacyPolicyPage({ params }: PrivacyPageProps) {
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
            ? 'ملاحظة: هذا النص مسودة لسياسة الخصوصية مخصص للمراجعة القانونية من قبل إدارة سبيدر سبايدر.'
            : 'Note: This draft privacy policy is subject to formal legal review by SpeederSpider management.'}
        </span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display">
        {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
      </h1>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <p>
          {isRtl
            ? 'نحن في سبيدر سبايدر (دبي، الإمارات العربية المتحدة) نلتزم بحماية خصوصية بيانات زوارنا وعملائنا الكرام.'
            : 'At SpeederSpider (Dubai, UAE), we are committed to safeguarding the personal information and privacy of our website visitors and workshop clients.'}
        </p>

        <h2 className="text-xl font-bold text-white font-display pt-4">
          {isRtl ? '1. البيانات التي نجمعها' : '1. Information We Collect'}
        </h2>
        <p>
          {isRtl
            ? 'عند تعبئة استمارة التواصل أو التواصل عبر واتساب، قد نجمع الاسم الكامل، ورقم الهاتف، والبريد الإلكتروني، وتفاصيل السيارة المراد صيانتها أو تعديلها.'
            : 'When you submit an enquiry through our contact forms or message our WhatsApp channels, we collect your name, email, phone number, and submitted vehicle specifications.'}
        </p>

        <h2 className="text-xl font-bold text-white font-display pt-4">
          {isRtl ? '2. كيفية استخدام البيانات' : '2. How We Use Information'}
        </h2>
        <p>
          {isRtl
            ? 'تُستخدم بياناتكم حصرياً للرد على استفساراتكم وتقديم عروض الأسعار والتنسيق لمواعيد الخدمة داخل ورشتنا في دبي.'
            : 'Your information is used strictly to respond to automotive service inquiries, provide accurate cost estimates, and coordinate workshop visit schedules.'}
        </p>

        <h2 className="text-xl font-bold text-white font-display pt-4">
          {isRtl ? '3. التواصل معنا' : '3. Contact Us'}
        </h2>
        <p>
          {isRtl
            ? 'لأي استفسارات بخصوص الخصوصية، يرجى التواصل معنا على الهاتف: 0565694440 أو زيارة مركزنا في دبي.'
            : 'For privacy inquiries, please contact our workshop management at +971 56 569 4440 or visit our workshop in Dubai.'}
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
