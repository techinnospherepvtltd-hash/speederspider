import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/data/db';
import { Language } from '@/types';
import { BeforeAfterSlider } from '@/components/automotive/BeforeAfterSlider';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/SocialIcons';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProjectDetailPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: 'Project Not Found | SpeederSpider' };

  const isRtl = lang === 'ar';
  const title = isRtl
    ? (project.seo_title_ar || `${project.title_ar} | SpeederSpider دبي`)
    : (project.seo_title_en || `${project.title_en} | SpeederSpider Dubai`);
  const description = isRtl
    ? (project.seo_desc_ar || project.short_desc_ar || project.desc_ar)
    : (project.seo_desc_en || project.short_desc_en || project.desc_en);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: project.after_image }],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { lang: paramLang, slug } = await params;
  const lang = (paramLang === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = lang === 'ar';
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent(`مرحباً SpeederSpider! رأيت مشروع: ${project.title_ar} وأرغب في خدمة مماثلة لسيارتي.`)
      : encodeURIComponent(`Hello SpeederSpider! I saw your completed project: ${project.title_en} and would like similar work for my car.`);
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400">
        <Link href={`/${lang}`} className="hover:text-brand-cyan transition-colors">
          {isRtl ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <Link href={`/${lang}/our-work`} className="hover:text-brand-cyan transition-colors">
          {isRtl ? 'المشاريع' : 'Our Work'}
        </Link>
        <span>/</span>
        <span className="text-brand-cyan font-bold truncate">
          {isRtl ? project.title_ar : project.title_en}
        </span>
      </nav>

      {/* Project Title Header */}
      <div className="space-y-4 max-w-4xl">
        {project.vehicle_make && (
          <span className="inline-block px-3 py-1 rounded bg-brand-navy border border-brand-steelBlue/40 text-xs font-mono uppercase text-brand-warmBeige">
            {project.vehicle_make} {project.vehicle_model} {project.vehicle_year && `(${project.vehicle_year})`}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase font-display leading-tight">
          {isRtl ? project.title_ar : project.title_en}
        </h1>
        <p className="text-gray-300 text-base leading-relaxed">
          {isRtl ? project.desc_ar : project.desc_en}
        </p>
      </div>

      {/* Interactive Before & After Slider */}
      <div className="space-y-4">
        <div className="max-w-5xl mx-auto">
          <BeforeAfterSlider
            beforeImage={project.before_image}
            afterImage={project.after_image}
            beforeLabel={isRtl ? 'قبل التعديل' : 'Before'}
            afterLabel={isRtl ? 'بعد الإنجاز' : 'After'}
            beforeAlt={`Before image for ${project.title_en}`}
            afterAlt={`After image for ${project.title_en}`}
            aspectRatio="16/9"
          />
          <p className="text-center text-xs font-mono uppercase tracking-wider text-gray-500 mt-4">
            {isRtl ? 'اسحب الشريط لمعاينة نتيجة العمل بدقة' : 'Drag the slider horizontally to compare before and after states'}
          </p>
        </div>
      </div>

      {/* Action CTA Box */}
      <div className="p-8 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-white font-display">
            {isRtl ? 'هل ترغب في نتيجة مماثلة لسيارتك؟' : 'Interested in a Similar Transformation?'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            {isRtl
              ? 'تحدث مباشرة مع خبرائنا في ورشة دبي لمناقشة التفاصيل والتكلفة.'
              : 'Message our Dubai workshop team directly on WhatsApp with your vehicle specs.'}
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20ba5a] rounded-lg transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)] shrink-0"
        >
          <WhatsAppIcon className="w-4 h-4 fill-current" />
          <span>{isRtl ? 'استفسار فوري عبر واتساب' : 'Inquire on WhatsApp'}</span>
        </a>
      </div>
    </div>
  );
}
