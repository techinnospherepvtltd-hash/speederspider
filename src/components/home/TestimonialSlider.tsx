'use client';

import React, { useRef, useState, useEffect } from 'react';
import { TestimonialItem, Language } from '@/types';
import { Star, ChevronLeft, ChevronRight, CheckCircle, Car, Quote } from 'lucide-react';

interface TestimonialSliderProps {
  testimonials: TestimonialItem[];
  lang: Language;
}

export function TestimonialSlider({ testimonials, lang }: TestimonialSliderProps) {
  const isRtl = lang === 'ar';
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    if (isRtl) {
      // In RTL, scrollLeft can be negative or positive depending on browser implementation
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = Math.abs(scrollLeft);
      setCanScrollLeft(currentScroll < maxScroll - 10);
      setCanScrollRight(currentScroll > 10);
    } else {
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }

    // Estimate active card index
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 360;
    const idx = Math.round(Math.abs(scrollLeft) / cardWidth);
    setActiveIndex(Math.min(idx, testimonials.length - 1));
  };

  useEffect(() => {
    checkScroll();
    const el = sliderRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [testimonials, isRtl]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;

    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 380;
    const multiplier = direction === 'left' ? -1 : 1;
    const delta = isRtl ? -multiplier * cardWidth : multiplier * cardWidth;

    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <div className="relative space-y-6">
      {/* Slider Controls Bar */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
            {isRtl ? 'آراء العملاء الموثقة' : 'Verified Reviews'}
          </span>
          <span className="text-xs font-mono font-bold text-brand-cyan">
            ({testimonials.length})
          </span>
        </div>

        {/* Dual-Direction Scroll Buttons */}
        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={() => scrollByAmount('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll testimonials left"
            className={`p-2.5 rounded-xl border transition-all ${
              canScrollLeft
                ? 'bg-brand-navy border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan hover:text-brand-deepNavy hover:border-brand-cyan shadow-[0_0_12px_rgba(91,192,222,0.25)]'
                : 'bg-brand-navy/50 border-brand-steelBlue/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => scrollByAmount('right')}
            disabled={!canScrollRight}
            aria-label="Scroll testimonials right"
            className={`p-2.5 rounded-xl border transition-all ${
              canScrollRight
                ? 'bg-brand-navy border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan hover:text-brand-deepNavy hover:border-brand-cyan shadow-[0_0_12px_rgba(91,192,222,0.25)]'
                : 'bg-brand-navy/50 border-brand-steelBlue/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Track */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {testimonials.map((t, idx) => (
          <div
            key={t.id}
            className="w-[88vw] sm:w-[380px] lg:w-[410px] shrink-0 snap-start p-7 sm:p-8 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/60 flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 relative group"
          >
            {/* Top Bar: Stars + Quote Icon */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-brand-amber">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-mono font-bold text-gray-300 ml-2">
                    {t.rating || 5}.0
                  </span>
                </div>
                <Quote className="w-6 h-6 text-brand-cyan/30 group-hover:text-brand-cyan/60 transition-colors" />
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-200 italic leading-relaxed">
                &ldquo;{isRtl ? (t.review_ar || t.review_en) : (t.review_en || t.review_ar)}&rdquo;
              </p>
            </div>

            {/* Bottom: Client Name + Vehicle Tag */}
            <div className="pt-4 border-t border-brand-steelBlue/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white font-display uppercase tracking-wide truncate">
                  {isRtl ? (t.client_name_ar || t.client_name_en) : (t.client_name_en || t.client_name_ar)}
                </h4>
                {t.vehicle_info && (
                  <p className="text-xs font-mono text-brand-cyan flex items-center gap-1.5 mt-0.5 truncate">
                    <Car className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.vehicle_info}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 text-emerald-400" title="Verified SpeederSpider Client">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Dots Indicator */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = sliderRef.current;
              if (!el) return;
              const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 380;
              const target = isRtl ? -i * cardWidth : i * cardWidth;
              el.scrollTo({ left: target, behavior: 'smooth' });
            }}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? 'w-7 bg-brand-cyan'
                : 'w-2 bg-brand-steelBlue/50 hover:bg-brand-steelBlue'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
