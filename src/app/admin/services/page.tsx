'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ServiceItem } from '@/types';
import { INITIAL_SERVICES } from '@/lib/data/mock-data';
import { Wrench, Edit, Eye, EyeOff, Check, X, Plus } from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const togglePublish = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_published: !s.is_published } : s))
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setServices((prev) =>
      prev.map((s) => (s.id === editingService.id ? editingService : s))
    );
    setEditingService(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display">
            Automotive Services Management
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Manage bilingual content, imagery, and visibility for all 7 disciplines
          </p>
        </div>

        <button
          onClick={() => {
            const newS: ServiceItem = {
              id: 's-' + Date.now(),
              slug_en: 'new-service',
              slug_ar: 'new-service',
              title_en: 'New Automotive Service',
              title_ar: 'خدمة جديدة للسيارات',
              short_desc_en: 'Short description of the new service.',
              short_desc_ar: 'وصف موجز للخدمة الجديدة.',
              description_en: 'Full technical description of the new service.',
              description_ar: 'الوصف الفني الكامل للخدمة الجديدة.',
              icon_name: 'Wrench',
              featured_image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
              gallery_images: [],
              display_order: services.length + 1,
              is_published: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setServices([...services, newS]);
            setEditingService(newS);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto rounded-xl border border-brand-steelBlue/40 bg-brand-navy shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-brand-deepNavy/80 text-[11px] font-mono uppercase text-gray-400 border-b border-brand-steelBlue/30">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Title (English)</th>
              <th className="py-3 px-4">Title (Arabic)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-steelBlue/20 font-mono">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-brand-deepNavy/40 transition-colors">
                <td className="py-3 px-4 font-bold text-brand-cyan">#{service.display_order}</td>
                <td className="py-3 px-4">
                  <div className="relative w-12 h-10 rounded overflow-hidden bg-brand-deepNavy">
                    <Image
                      src={service.featured_image}
                      alt={service.title_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-white font-sans">{service.title_en}</td>
                <td className="py-3 px-4 font-sans text-right" dir="rtl">{service.title_ar}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      service.is_published
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {service.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => togglePublish(service.id)}
                      className="p-1.5 rounded hover:bg-brand-steelBlue/30 text-gray-300 hover:text-white"
                      title={service.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {service.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-brand-cyan" />}
                    </button>
                    <button
                      onClick={() => setEditingService(service)}
                      className="p-1.5 rounded hover:bg-brand-steelBlue/30 text-brand-cyan"
                      title="Edit Service"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase">
                Edit Service: {editingService.title_en}
              </h2>
              <button
                onClick={() => setEditingService(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    required
                    value={editingService.title_en}
                    onChange={(e) => setEditingService({ ...editingService, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (AR)</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={editingService.title_ar}
                    onChange={(e) => setEditingService({ ...editingService, title_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:border-brand-cyan text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Featured Image URL</label>
                <input
                  type="text"
                  required
                  value={editingService.featured_image}
                  onChange={(e) => setEditingService({ ...editingService, featured_image: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:border-brand-cyan font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Description (EN)</label>
                <textarea
                  rows={3}
                  value={editingService.description_en}
                  onChange={(e) => setEditingService({ ...editingService, description_en: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Description (AR)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={editingService.description_ar}
                  onChange={(e) => setEditingService({ ...editingService, description_ar: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:border-brand-cyan text-right"
                />
              </div>

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
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded hover:bg-brand-cyan/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
