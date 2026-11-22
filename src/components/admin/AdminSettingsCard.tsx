'use client';

import React, { useState, useEffect } from 'react';
import { Star, Link as LinkIcon, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

export function AdminSettingsCard() {
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings?.google_review_url) {
          setGoogleReviewUrl(data.settings.google_review_url);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleReviewUrl: googleReviewUrl.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Google Review URL updated successfully!' });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to update settings' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error while saving settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-steelBlue/30">
        <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Star className="w-4 h-4 text-brand-amber fill-brand-amber" />
          Google Business Profile & Review Link
        </h2>
        <span className="text-[11px] font-mono text-gray-400 uppercase">
          Reputation Management
        </span>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">
        Configure the official Google Business review URL for SpeederSpider. When active, visitors can click
        <strong className="text-white"> &ldquo;Rate Us on Google&rdquo;</strong> in the website footer, contact page, and reviews section.
        If empty, the button is safely disabled or hidden to maintain integrity.
      </p>

      {loading ? (
        <div className="py-4 flex items-center gap-2 text-gray-400 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-brand-cyan" />
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-gray-300">
              Official Google Review URL (e.g. https://g.page/r/.../review)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="https://g.page/r/YOUR_SPEEDERSPIDER_CODE/review"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-brand-cyan"
                />
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-brand-cyan hover:text-white flex items-center gap-1.5 text-xs font-mono shrink-0"
                  title="Test Link in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Test Link</span>
                </a>
              )}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-gray-400">
              {googleReviewUrl ? 'Link is configured & active' : 'No link configured (CTA disabled on site)'}
            </span>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Google Link</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
