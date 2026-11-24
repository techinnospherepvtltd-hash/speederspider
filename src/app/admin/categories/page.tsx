'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InventoryCategory } from '@/types';
import {
  Tags,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Search,
  Tag,
  AlertCircle,
  FolderTree,
  Boxes,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface CategoryFormData {
  id?: string;
  name_en: string;
  name_ar: string;
  slug: string;
  description: string;
}

const defaultFormData: CategoryFormData = {
  name_en: '',
  name_ar: '',
  slug: '',
  description: '',
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setFormData(defaultFormData);
    setIsEditing(false);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: InventoryCategory) => {
    setFormData({
      id: c.id,
      name_en: c.name_en || '',
      name_ar: c.name_ar || '',
      slug: c.slug || '',
      description: c.description || '',
    });
    setIsEditing(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!formData.name_en.trim()) {
        throw new Error('Category Name (English) is required');
      }
      if (!formData.name_ar.trim()) {
        throw new Error('Category Name (Arabic) is required');
      }

      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name_en: formData.name_en.trim(),
          name_ar: formData.name_ar.trim(),
          slug: (formData.slug.trim() || formData.name_en.trim())
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          description: formData.description.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save category');
      }

      setSuccessMsg(isEditing ? 'Category updated successfully!' : 'New category created successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      setError(null);
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Failed to delete category');
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccessMsg('Category deleted successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(err.message || 'An error occurred while deleting.');
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_ar.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-display tracking-wide flex items-center gap-2.5">
              <FolderTree className="w-7 h-7 text-brand-cyan" />
              <span>Unified Category Management</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Centrally manage categories used across Product Catalogues, Internal Inventory, and Workshop Services.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-brand-deepNavy font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(91,192,222,0.3)] transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Cross-Module Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-brand-navy/60 border border-brand-steelBlue/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-deepNavy text-brand-cyan">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Product Catalogue</p>
              <p className="text-xs text-gray-400">Categories organize public store items & WhatsApp links</p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-mono text-brand-cyan hover:underline flex items-center gap-1"
          >
            <span>Products</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-brand-navy/60 border border-brand-steelBlue/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-deepNavy text-brand-cyan">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Workshop Inventory</p>
              <p className="text-xs text-gray-400">Categories categorize parts, raw leather & detailing stock</p>
            </div>
          </div>
          <Link
            href="/admin/inventory"
            className="text-xs font-mono text-brand-cyan hover:underline flex items-center gap-1"
          >
            <span>Inventory</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-brand-navy border border-brand-steelBlue/40">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cyan/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name (English or Arabic), slug, or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-deepNavy border border-brand-steelBlue/50 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-cyan"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
          <p className="text-xs font-mono text-gray-400">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-brand-navy/30 border border-brand-steelBlue/30 rounded-2xl p-8 space-y-4">
          <FolderTree className="w-12 h-12 text-gray-500 mx-auto opacity-40" />
          <h3 className="text-lg font-bold text-white font-display">No categories found</h3>
          <p className="text-xs text-gray-400">
            {search ? 'Try clearing your search query.' : 'Click "Add New Category" above to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/60 transition-all shadow-lg space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/40 text-brand-cyan group-hover:border-brand-cyan/50 transition-colors">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white font-display">
                        {c.name_en}
                      </h2>
                      <p className="text-xs text-brand-cyan/80 font-sans" dir="rtl">
                        {c.name_ar}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-deepNavy border border-brand-steelBlue/60 text-gray-300">
                    {c.slug}
                  </span>
                </div>

                {c.description ? (
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                    {c.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic">No description provided.</p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-brand-steelBlue/30 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400">
                  Shared Category
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-gray-300 hover:text-brand-cyan hover:border-brand-cyan transition-colors"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(c.id)}
                    className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-gray-300 hover:text-rose-400 hover:border-rose-400 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl bg-brand-deepNavy border border-brand-steelBlue/60 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold font-display text-white">Delete Category</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to delete this category? If any inventory items or products are assigned to it, deletion will be blocked to maintain data integrity.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-brand-navy border border-brand-steelBlue/40"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-brand-deepNavy border border-brand-steelBlue/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  {isEditing ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  Universal category for Products and Inventory
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-navy border border-brand-steelBlue/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 mt-6">
              {/* Category Name English */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 uppercase">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Multimedia & Audio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Category Name Arabic */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 uppercase">
                  Category Name (Arabic) *
                </label>
                <input
                  type="text"
                  dir="rtl"
                  required
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="مثال: أنظمة الصوت والشاشات"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 uppercase flex items-center justify-between">
                  <span>URL Slug</span>
                  <span className="text-[11px] text-brand-cyan font-normal">Auto-generated if left blank</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. multimedia-audio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 uppercase">
                  Description / Items Included
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what products and inventory stock belong in this category..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-steelBlue/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-brand-deepNavy text-xs font-bold uppercase tracking-wider shadow-lg disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
