'use client';

import React, { useState } from 'react';
import { TestimonialItem } from '@/types';
import { INITIAL_TESTIMONIALS } from '@/lib/data/mock-data';
import { Star, Plus, Edit, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);

  const togglePublish = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_published: !t.is_published } : t))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display">
            Customer Testimonials
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Genuine verified feedback from vehicle owners
          </p>
        </div>

        <button
          onClick={() => {
            const newT: TestimonialItem = {
              id: 't-' + Date.now(),
              client_name_en: 'New Verified Client',
              client_name_ar: 'عميل جديد موثق',
              vehicle_info: 'Mercedes G63',
              rating: 5,
              review_en: 'Exceptional detailing and upholstery service.',
              review_ar: 'خدمة تلميع وتنجيد استثنائية وعالية الجودة.',
              avatar_url: null,
              is_published: true,
              display_order: testimonials.length + 1,
              created_at: new Date().toISOString(),
            };
            setTestimonials([...testimonials, newT]);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-brand-amber">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <button
                  onClick={() => togglePublish(t.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    t.is_published
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {t.is_published ? 'Published' : 'Hidden'}
                </button>
              </div>

              <p className="text-xs text-gray-300 italic leading-relaxed">
                &ldquo;{t.review_en}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-brand-steelBlue/30">
              <p className="text-sm font-bold text-white font-display">{t.client_name_en}</p>
              <p className="text-xs font-mono text-gray-400">{t.vehicle_info || 'Dubai Client'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
