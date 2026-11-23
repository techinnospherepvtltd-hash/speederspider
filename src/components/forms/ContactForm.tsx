'use client';

import React, { useState } from 'react';
import { dictionaries } from '@/lib/i18n/translations';
import { Language, ServiceItem } from '@/types';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/SocialIcons';

interface ContactFormProps {
  lang: Language;
  services: ServiceItem[];
  preselectedServiceId?: string;
}

export function ContactForm({ lang, services, preselectedServiceId }: ContactFormProps) {
  const dict = dictionaries[lang];
  const isRtl = lang === 'ar';

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    serviceId: preselectedServiceId || '',
    message: '',
    hpToken: '', // Anti-spam honeypot (should stay empty)
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    // Quick client check
    if (!formData.customerName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setStatus('error');
      setErrorMessage(isRtl ? 'يرجى ملء الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferredLanguage: lang,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setFormData({
          customerName: '',
          email: '',
          phone: '',
          serviceId: '',
          message: '',
          hpToken: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(data.message || dict.contact.errorMessage);
      }
    } catch {
      setStatus('error');
      setErrorMessage(dict.contact.errorMessage);
    }
  };

  const whatsappMessage =
    lang === 'ar'
      ? encodeURIComponent("مرحباً SpeederSpider! أود الاستفسار مباشرة عبر واتساب عن خدماتكم.")
      : encodeURIComponent("Hello SpeederSpider! I would like to enquire directly via WhatsApp about your services.");
  const whatsappUrl = `https://wa.me/971565694440?text=${whatsappMessage}`;

  return (
    <div className="w-full bg-brand-navy border border-brand-steelBlue/40 rounded-2xl p-6 sm:p-10 shadow-2xl">
      {status === 'success' ? (
        <div className="text-center py-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white font-display">
            {dict.contact.successTitle}
          </h3>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            {dict.contact.successMessage}
          </p>
          <div className="pt-4">
            <button
              onClick={() => setStatus('idle')}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded-md hover:bg-brand-cyan/90 transition-all"
            >
              {isRtl ? 'إرسال طلب آخر' : 'Send Another Enquiry'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot anti-spam field hidden from humans */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="hpToken">Security Token</label>
            <input
              id="hpToken"
              type="text"
              name="hpToken"
              tabIndex={-1}
              autoComplete="off"
              value={formData.hpToken}
              onChange={(e) => setFormData({ ...formData, hpToken: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-2">
                {dict.contact.fullName} <span className="text-brand-cyan">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={dict.contact.fullNamePlaceholder}
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition-colors text-sm"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-2">
                {dict.contact.email} <span className="text-brand-cyan">*</span>
              </label>
              <input
                type="email"
                required
                placeholder={dict.contact.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-2">
                {dict.contact.phone} <span className="text-brand-cyan">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder={dict.contact.phonePlaceholder}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition-colors text-sm font-mono"
              />
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-2">
                {dict.contact.service}
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full px-4 py-3 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-white focus:outline-none focus:border-brand-cyan transition-colors text-sm"
              >
                <option value="">{dict.contact.serviceSelectPlaceholder}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isRtl ? s.title_ar : s.title_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message / Vehicle Details */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-2">
              {dict.contact.message}
            </label>
            <textarea
              rows={4}
              placeholder={dict.contact.messagePlaceholder}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition-colors text-sm leading-relaxed"
            />
          </div>

          {/* Error banner */}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 disabled:opacity-50 rounded-lg transition-all shadow-[0_0_20px_rgba(91,192,222,0.4)]"
            >
              <Send className="w-4 h-4" />
              <span>{status === 'submitting' ? dict.contact.submittingBtn : dict.contact.submitBtn}</span>
            </button>

            {/* Direct WhatsApp link fallback */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-[#25D366] hover:text-[#20ba5a] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
              <span>{isRtl ? 'أو تواصل فوراً عبر واتساب (0565694440)' : 'Or chat instantly via WhatsApp (0565694440)'}</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
