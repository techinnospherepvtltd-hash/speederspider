'use client';

import React, { useState, useEffect } from 'react';
import { TestimonialItem } from '@/types';
import {
  Star,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Search,
  Car,
  User,
  Quote,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';

interface TestimonialFormData {
  id?: string;
  client_name_en: string;
  client_name_ar: string;
  vehicle_info: string;
  rating: number;
  review_en: string;
  review_ar: string;
  avatar_url: string;
  is_published: boolean;
  display_order: number;
}

const defaultFormData: TestimonialFormData = {
  client_name_en: '',
  client_name_ar: '',
  vehicle_info: '',
  rating: 5,
  review_en: '',
  review_ar: '',
  avatar_url: '',
  is_published: true,
  display_order: 1,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TestimonialFormData>(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (data.success && Array.isArray(data.testimonials)) {
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setFormData({
      ...defaultFormData,
      display_order: testimonials.length + 1,
    });
    setIsEditing(false);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: TestimonialItem) => {
    setFormData({
      id: t.id,
      client_name_en: t.client_name_en || '',
      client_name_ar: t.client_name_ar || '',
      vehicle_info: t.vehicle_info || '',
      rating: t.rating || 5,
      review_en: t.review_en || '',
      review_ar: t.review_ar || '',
      avatar_url: t.avatar_url || '',
      is_published: t.is_published,
      display_order: t.display_order || 1,
    });
    setIsEditing(true);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name_en.trim()) {
      setError('Client name (English) is required.');
      return;
    }
    if (!formData.review_en.trim()) {
      setError('Review text (English) is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = '/api/testimonials';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        client_name_ar: formData.client_name_ar.trim() || formData.client_name_en.trim(),
        review_ar: formData.review_ar.trim() || formData.review_en.trim(),
        rating: Number(formData.rating) || 5,
        display_order: Number(formData.display_order) || 1,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (data.errors ? data.errors[0]?.message : 'Failed to save testimonial'));
      }

      setSuccessMsg(isEditing ? 'Testimonial updated successfully!' : 'Testimonial created successfully!');
      setTimeout(() => setSuccessMsg(null), 3500);

      closeModal();
      await fetchTestimonials();
    } catch (err: any) {
      console.error('Error saving testimonial:', err);
      setError(err?.message || 'Error occurred while saving testimonial');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (t: TestimonialItem) => {
    try {
      const updatedStatus = !t.is_published;
      const res = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, is_published: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) =>
          prev.map((item) => (item.id === t.id ? { ...item, is_published: updatedStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the testimonial from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) => prev.filter((item) => item.id !== id));
        setSuccessMsg('Testimonial deleted successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Network error deleting testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.client_name_en && t.client_name_en.toLowerCase().includes(q)) ||
      (t.client_name_ar && t.client_name_ar.toLowerCase().includes(q)) ||
      (t.vehicle_info && t.vehicle_info.toLowerCase().includes(q)) ||
      (t.review_en && t.review_en.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
            <Quote className="w-6 h-6 text-brand-cyan" />
            Customer Testimonials
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Create and manage verified client reviews for the live homepage dual-direction scroll slider
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all shadow-[0_0_15px_rgba(91,192,222,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Overview Bar */}
      <div className="p-4 rounded-xl bg-brand-navy border border-brand-steelBlue/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search client, car model, or review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <span>
            Total: <strong className="text-white">{testimonials.length}</strong>
          </span>
          <span>•</span>
          <span>
            Published Live:{' '}
            <strong className="text-brand-cyan">
              {testimonials.filter((t) => t.is_published).length}
            </strong>
          </span>
        </div>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
          <p className="text-xs font-mono text-gray-400">Loading verified testimonials...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-brand-navy/60 border border-brand-steelBlue/30 space-y-3">
          <Quote className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white font-display uppercase">No Testimonials Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {search ? 'No testimonials matched your search query.' : 'Click "Add Testimonial" above to write your first client review.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t) => (
            <div
              key={t.id}
              className={`p-6 rounded-2xl bg-brand-navy border transition-all flex flex-col justify-between space-y-4 ${
                t.is_published
                  ? 'border-brand-steelBlue/40 hover:border-brand-cyan/60'
                  : 'border-brand-steelBlue/20 opacity-70'
              }`}
            >
              <div className="space-y-3">
                {/* Rating & Status Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-brand-amber">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-[10px] font-mono text-gray-400 ml-1.5">
                      {t.rating || 5}.0
                    </span>
                  </div>

                  <button
                    onClick={() => togglePublish(t)}
                    title={t.is_published ? 'Click to hide from live website' : 'Click to publish on live website'}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-colors ${
                      t.is_published
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {t.is_published ? (
                      <>
                        <Eye className="w-3 h-3" /> Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hidden
                      </>
                    )}
                  </button>
                </div>

                {/* English Review */}
                <div>
                  <span className="text-[9px] font-mono uppercase text-gray-500">English Review:</span>
                  <p className="text-xs text-gray-200 italic leading-relaxed line-clamp-3 mt-0.5">
                    &ldquo;{t.review_en}&rdquo;
                  </p>
                </div>

                {/* Arabic Review */}
                {t.review_ar && (
                  <div className="pt-2 border-t border-brand-steelBlue/20">
                    <span className="text-[9px] font-mono uppercase text-gray-500">Arabic Review:</span>
                    <p className="text-xs text-gray-300 italic leading-relaxed line-clamp-2 mt-0.5" dir="rtl">
                      &ldquo;{t.review_ar}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Client Info & Action Controls */}
              <div className="pt-4 border-t border-brand-steelBlue/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white font-display truncate">
                    {t.client_name_en}
                    {t.client_name_ar && t.client_name_ar !== t.client_name_en && (
                      <span className="text-xs font-normal text-gray-400 ml-1.5">
                        ({t.client_name_ar})
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-mono text-brand-cyan flex items-center gap-1.5 mt-0.5 truncate">
                    <Car className="w-3 h-3 shrink-0" />
                    <span>{t.vehicle_info || 'Dubai Client'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-gray-300 hover:text-brand-cyan hover:border-brand-cyan transition-colors"
                    title="Edit Testimonial"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.client_name_en)}
                    className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-gray-300 hover:text-red-400 hover:border-red-500/50 transition-colors"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Testimonial Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <div>
                <h2 className="text-lg font-bold text-white font-display uppercase flex items-center gap-2">
                  <Quote className="w-5 h-5 text-brand-cyan" />
                  {isEditing ? 'Edit Customer Testimonial' : 'Create New Testimonial'}
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  Write genuine client review details to show on the live website slider
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Client Names Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                    Client Name (English) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rashid Al-Falasi"
                      value={formData.client_name_en}
                      onChange={(e) => setFormData({ ...formData, client_name_en: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                    Client Name (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: راشد الفلاسي"
                    value={formData.client_name_ar}
                    onChange={(e) => setFormData({ ...formData, client_name_ar: e.target.value })}
                    className="w-full px-3 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Vehicle Info & Rating Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                    Vehicle Model / Car Info
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 2023 Porsche 911 GT3"
                      value={formData.vehicle_info}
                      onChange={(e) => setFormData({ ...formData, vehicle_info: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                    />
                    <Car className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 text-brand-amber hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating ? 'fill-current' : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-white ml-2">
                      {formData.rating} Star{formData.rating > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* English Review */}
              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                  Testimonial / Review Text (English) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe client feedback, experience with SpeederSpider atelier, quality of craftsmanship..."
                  value={formData.review_en}
                  onChange={(e) => setFormData({ ...formData, review_en: e.target.value })}
                  className="w-full px-3 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Arabic Review */}
              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                  Testimonial / Review Text (Arabic)
                </label>
                <textarea
                  dir="rtl"
                  rows={3}
                  placeholder="تفاصيل التقييم باللغة العربية (اختياري، يملأ تلقائياً في حال تركه فارغاً)..."
                  value={formData.review_ar}
                  onChange={(e) => setFormData({ ...formData, review_ar: e.target.value })}
                  className="w-full px-3 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Avatar URL & Display Order Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                    Client Avatar URL (Optional / Google Drive)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://drive.google.com/file/d/..."
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                    />
                    <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded bg-brand-deepNavy border-brand-steelBlue/50 text-brand-cyan focus:ring-brand-cyan"
                />
                <label htmlFor="is_published" className="text-xs font-mono uppercase text-white cursor-pointer">
                  Publish immediately on live website carousel
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-steelBlue/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? 'Update Testimonial' : 'Create Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
