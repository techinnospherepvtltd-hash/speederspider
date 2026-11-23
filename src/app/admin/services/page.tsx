'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ServiceItem } from '@/types';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import {
  Wrench,
  Edit,
  Eye,
  EyeOff,
  Plus,
  X,
  Trash2,
  SlidersHorizontal,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmService, setDeleteConfirmService] = useState<ServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const initialServiceState: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'> = {
    slug_en: '',
    slug_ar: '',
    title_en: '',
    title_ar: '',
    short_desc_en: '',
    short_desc_ar: '',
    description_en: '',
    description_ar: '',
    icon_name: 'Wrench',
    featured_image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    before_image: '',
    after_image: '',
    before_caption_en: '',
    before_caption_ar: '',
    after_caption_en: '',
    after_caption_ar: '',
    before_alt_en: '',
    before_alt_ar: '',
    after_alt_en: '',
    after_alt_ar: '',
    gallery_images: [],
    display_order: 1,
    is_published: true,
    seo_title_en: '',
    seo_title_ar: '',
    seo_desc_en: '',
    seo_desc_ar: '',
  };

  const [formData, setFormData] = useState(initialServiceState);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAddModal = () => {
    const defaultSlug = 'service-' + Math.random().toString(36).substring(2, 7);
    setFormData({
      ...initialServiceState,
      slug_en: defaultSlug,
      slug_ar: defaultSlug,
      display_order: services.length + 1,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    const payload = {
      ...formData,
      featured_image: normalizeGoogleDriveUrl(formData.featured_image),
      before_image: formData.before_image ? normalizeGoogleDriveUrl(formData.before_image) : null,
      after_image: formData.after_image ? normalizeGoogleDriveUrl(formData.after_image) : null,
      gallery_images: (formData.gallery_images || []).map(normalizeGoogleDriveUrl),
    };

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.errors?.[0]?.message || data.message || 'Failed to create service');
        setIsSaving(false);
        return;
      }

      setServices((prev) => [...prev, data.service].sort((a, b) => a.display_order - b.display_order));
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError('Network error while saving service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setFormError('');
    setIsSaving(true);

    const payload = {
      ...editingService,
      featured_image: normalizeGoogleDriveUrl(editingService.featured_image),
      before_image: editingService.before_image ? normalizeGoogleDriveUrl(editingService.before_image) : null,
      after_image: editingService.after_image ? normalizeGoogleDriveUrl(editingService.after_image) : null,
      gallery_images: (editingService.gallery_images || []).map(normalizeGoogleDriveUrl),
    };

    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to update service');
        setIsSaving(false);
        return;
      }

      setServices((prev) =>
        prev.map((s) => (s.id === data.service.id ? data.service : s)).sort((a, b) => a.display_order - b.display_order)
      );
      setEditingService(null);
    } catch (err) {
      setFormError('Network error while updating service');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (service: ServiceItem) => {
    const updatedStatus = !service.is_published;
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, is_published: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, is_published: updatedStatus } : s))
        );
      }
    } catch (err) {
      console.error('Failed to toggle service status:', err);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        setDeleteConfirmService(null);
      } else {
        alert(data.message || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Failed to delete service:', err);
      alert('Network error while deleting service');
    }
  };

  const filteredServices = services.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title_en.toLowerCase().includes(q) ||
      s.title_ar.toLowerCase().includes(q) ||
      s.slug_en.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
            <Wrench className="w-6 h-6 text-brand-cyan" />
            Automotive Services & Before/After Management
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Manage bilingual content, dedicated Before & After visual comparison images, and visibility for all disciplines
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors shadow-[0_0_15px_rgba(91,192,222,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-navy border border-brand-steelBlue/40 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <span>Total Services: <strong className="text-white">{services.length}</strong></span>
          <span>•</span>
          <span>Published: <strong className="text-emerald-400">{services.filter(s => s.is_published).length}</strong></span>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 rounded-xl bg-brand-navy/50 border border-brand-steelBlue/30">
          <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-brand-navy/30 border border-brand-steelBlue/20">
          <p className="text-sm font-mono text-gray-400">No services found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-steelBlue/40 bg-brand-navy shadow-xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-brand-deepNavy/80 text-[11px] font-mono uppercase text-gray-400 border-b border-brand-steelBlue/30">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Featured Image</th>
                <th className="py-3 px-4">Before / After Set</th>
                <th className="py-3 px-4">Title (English)</th>
                <th className="py-3 px-4">Title (Arabic)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-steelBlue/20 font-mono">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-brand-deepNavy/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-brand-cyan">#{service.display_order}</td>
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-10 rounded overflow-hidden bg-brand-deepNavy border border-brand-steelBlue/40">
                      {service.featured_image ? (
                        <Image
                          src={normalizeGoogleDriveUrl(service.featured_image)}
                          alt={service.title_en}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {service.before_image && service.after_image ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-[11px] text-emerald-300 font-bold">Configured</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-amber" />
                        <span className="text-[11px] text-brand-amber font-bold">Not Set</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white font-sans">{service.title_en}</td>
                  <td className="py-3 px-4 font-sans text-right" dir="rtl">{service.title_ar}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => togglePublish(service)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                        service.is_published
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                      }`}
                    >
                      {service.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(service)}
                        className="p-1.5 rounded hover:bg-brand-steelBlue/30 text-gray-300 hover:text-white transition-colors"
                        title={service.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {service.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-brand-cyan" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setFormError('');
                        }}
                        className="p-1.5 rounded hover:bg-brand-steelBlue/30 text-brand-cyan hover:text-white transition-colors"
                        title="Edit Service & Before/After"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmService(service)}
                        className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. ADD SERVICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-cyan" />
                Add New Automotive Service
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-5">
              {/* Slugs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Slug (English URL) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug_en}
                    onChange={(e) => setFormData({ ...formData, slug_en: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Slug (Arabic URL) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug_ar}
                    onChange={(e) => setFormData({ ...formData, slug_ar: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Title (English) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Title (Arabic) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Short Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Short Summary (English) <span className="text-brand-cyan">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.short_desc_en}
                    onChange={(e) => setFormData({ ...formData, short_desc_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Short Summary (Arabic) <span className="text-brand-cyan">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    dir="rtl"
                    value={formData.short_desc_ar}
                    onChange={(e) => setFormData({ ...formData, short_desc_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Full Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Full Description (English) <span className="text-brand-cyan">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Full Description (Arabic) <span className="text-brand-cyan">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    dir="rtl"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Main Featured Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-gray-300">
                    Main Featured Image URL <span className="text-brand-cyan">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://... or Google Drive share link"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: normalizeGoogleDriveUrl(e.target.value) })}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                />
                {formData.featured_image && (
                  <div className="relative h-28 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                    <Image
                      src={normalizeGoogleDriveUrl(formData.featured_image)}
                      alt="Featured Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Dedicated Before & After Image Box */}
              <div className="p-4 rounded-xl bg-brand-deepNavy/80 border border-brand-steelBlue/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-brand-steelBlue/30">
                  <span className="text-xs font-mono uppercase font-bold text-brand-amber flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-brand-amber" />
                    Dedicated Before & After Visual Comparison (Optional)
                  </span>
                  <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase text-gray-300">Before Image URL</label>
                      {formData.before_image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, before_image: '' })}
                          className="text-[10px] text-red-400 hover:underline font-mono"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://... or Google Drive share link"
                      value={formData.before_image || ''}
                      onChange={(e) => setFormData({ ...formData, before_image: normalizeGoogleDriveUrl(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-navy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                    {formData.before_image && (
                      <div className="relative h-24 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                        <Image
                          src={normalizeGoogleDriveUrl(formData.before_image)}
                          alt="Before Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Before Caption (EN)"
                      value={formData.before_caption_en || ''}
                      onChange={(e) => setFormData({ ...formData, before_caption_en: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="الوصف قبل التنفيذ (عربي)"
                      value={formData.before_caption_ar || ''}
                      onChange={(e) => setFormData({ ...formData, before_caption_ar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300 text-right"
                    />
                  </div>

                  {/* After Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase text-gray-300">After Image URL</label>
                      {formData.after_image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, after_image: '' })}
                          className="text-[10px] text-red-400 hover:underline font-mono"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://... or Google Drive share link"
                      value={formData.after_image || ''}
                      onChange={(e) => setFormData({ ...formData, after_image: normalizeGoogleDriveUrl(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-navy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                    {formData.after_image && (
                      <div className="relative h-24 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                        <Image
                          src={normalizeGoogleDriveUrl(formData.after_image)}
                          alt="After Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="After Caption (EN)"
                      value={formData.after_caption_en || ''}
                      onChange={(e) => setFormData({ ...formData, after_caption_en: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="الوصف بعد التنفيذ (عربي)"
                      value={formData.after_caption_ar || ''}
                      onChange={(e) => setFormData({ ...formData, after_caption_ar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300 text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Order, Icon & Publish */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/30 text-xs font-mono">
                <div>
                  <label className="block text-gray-400 mb-1">Display Order:</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1 bg-brand-navy border border-brand-steelBlue rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Icon Name:</label>
                  <select
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    className="w-full px-2 py-1 bg-brand-navy border border-brand-steelBlue rounded text-white"
                  >
                    <option value="Wrench">Wrench</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="Shield">Shield</option>
                    <option value="Sun">Sun</option>
                    <option value="Zap">Zap</option>
                    <option value="Cpu">Cpu</option>
                    <option value="Radio">Radio</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="rounded border-brand-steelBlue text-brand-cyan focus:ring-0"
                    />
                    <span className="text-white">Published on site</span>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded bg-red-900/30 border border-red-500/50 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-steelBlue/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded-lg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Service</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-cyan" />
                Edit Service: {editingService.title_en}
              </h2>
              <button onClick={() => setEditingService(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-5">
              {/* Slugs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Slug (English URL)</label>
                  <input
                    type="text"
                    required
                    value={editingService.slug_en}
                    onChange={(e) => setEditingService({ ...editingService, slug_en: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Slug (Arabic URL)</label>
                  <input
                    type="text"
                    required
                    value={editingService.slug_ar}
                    onChange={(e) => setEditingService({ ...editingService, slug_ar: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingService.title_en}
                    onChange={(e) => setEditingService({ ...editingService, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={editingService.title_ar}
                    onChange={(e) => setEditingService({ ...editingService, title_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Short Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Short Summary (English)</label>
                  <textarea
                    rows={2}
                    required
                    value={editingService.short_desc_en}
                    onChange={(e) => setEditingService({ ...editingService, short_desc_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Short Summary (Arabic)</label>
                  <textarea
                    rows={2}
                    required
                    dir="rtl"
                    value={editingService.short_desc_ar}
                    onChange={(e) => setEditingService({ ...editingService, short_desc_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Full Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Full Description (English)</label>
                  <textarea
                    rows={4}
                    required
                    value={editingService.description_en}
                    onChange={(e) => setEditingService({ ...editingService, description_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Full Description (Arabic)</label>
                  <textarea
                    rows={4}
                    required
                    dir="rtl"
                    value={editingService.description_ar}
                    onChange={(e) => setEditingService({ ...editingService, description_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Main Featured Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-gray-300">Main Featured Image URL</label>
                  <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://... or Google Drive share link"
                  value={editingService.featured_image}
                  onChange={(e) => setEditingService({ ...editingService, featured_image: normalizeGoogleDriveUrl(e.target.value) })}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                />
                {editingService.featured_image && (
                  <div className="relative h-28 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                    <Image
                      src={normalizeGoogleDriveUrl(editingService.featured_image)}
                      alt="Featured Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Dedicated Before & After Image Box */}
              <div className="p-4 rounded-xl bg-brand-deepNavy/80 border border-brand-steelBlue/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-brand-steelBlue/30">
                  <span className="text-xs font-mono uppercase font-bold text-brand-amber flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-brand-amber" />
                    Dedicated Before & After Visual Comparison (Optional)
                  </span>
                  <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase text-gray-300">Before Image URL</label>
                      {editingService.before_image && (
                        <button
                          type="button"
                          onClick={() => setEditingService({ ...editingService, before_image: '' })}
                          className="text-[10px] text-red-400 hover:underline font-mono"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://... or Google Drive share link"
                      value={editingService.before_image || ''}
                      onChange={(e) => setEditingService({ ...editingService, before_image: normalizeGoogleDriveUrl(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-navy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                    {editingService.before_image && (
                      <div className="relative h-24 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                        <Image
                          src={normalizeGoogleDriveUrl(editingService.before_image)}
                          alt="Before Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Before Caption (EN)"
                      value={editingService.before_caption_en || ''}
                      onChange={(e) => setEditingService({ ...editingService, before_caption_en: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="الوصف قبل التنفيذ (عربي)"
                      value={editingService.before_caption_ar || ''}
                      onChange={(e) => setEditingService({ ...editingService, before_caption_ar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300 text-right"
                    />
                  </div>

                  {/* After Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase text-gray-300">After Image URL</label>
                      {editingService.after_image && (
                        <button
                          type="button"
                          onClick={() => setEditingService({ ...editingService, after_image: '' })}
                          className="text-[10px] text-red-400 hover:underline font-mono"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://... or Google Drive share link"
                      value={editingService.after_image || ''}
                      onChange={(e) => setEditingService({ ...editingService, after_image: normalizeGoogleDriveUrl(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-navy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                    {editingService.after_image && (
                      <div className="relative h-24 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                        <Image
                          src={normalizeGoogleDriveUrl(editingService.after_image)}
                          alt="After Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="After Caption (EN)"
                      value={editingService.after_caption_en || ''}
                      onChange={(e) => setEditingService({ ...editingService, after_caption_en: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="الوصف بعد التنفيذ (عربي)"
                      value={editingService.after_caption_ar || ''}
                      onChange={(e) => setEditingService({ ...editingService, after_caption_ar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-navy border border-brand-steelBlue/40 rounded text-xs text-gray-300 text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Order, Icon & Publish */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/30 text-xs font-mono">
                <div>
                  <label className="block text-gray-400 mb-1">Display Order:</label>
                  <input
                    type="number"
                    value={editingService.display_order}
                    onChange={(e) => setEditingService({ ...editingService, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1 bg-brand-navy border border-brand-steelBlue rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Icon Name:</label>
                  <select
                    value={editingService.icon_name}
                    onChange={(e) => setEditingService({ ...editingService, icon_name: e.target.value })}
                    className="w-full px-2 py-1 bg-brand-navy border border-brand-steelBlue rounded text-white"
                  >
                    <option value="Wrench">Wrench</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="Shield">Shield</option>
                    <option value="Sun">Sun</option>
                    <option value="Zap">Zap</option>
                    <option value="Cpu">Cpu</option>
                    <option value="Radio">Radio</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={editingService.is_published}
                      onChange={(e) => setEditingService({ ...editingService, is_published: e.target.checked })}
                      className="rounded border-brand-steelBlue text-brand-cyan focus:ring-0"
                    />
                    <span className="text-white">Published on site</span>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded bg-red-900/30 border border-red-500/50 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-steelBlue/30">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded-lg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Service</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deleteConfirmService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-navy border border-red-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-base font-bold uppercase font-display text-white">Confirm Service Deletion</h2>
            </div>
            <p className="text-xs text-gray-300">
              Are you sure you want to delete <span className="text-white font-bold">{deleteConfirmService.title_en}</span>? This will remove the service and unbind any portfolio projects associated with it.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-steelBlue/30">
              <button
                type="button"
                onClick={() => setDeleteConfirmService(null)}
                className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteService(deleteConfirmService.id)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
