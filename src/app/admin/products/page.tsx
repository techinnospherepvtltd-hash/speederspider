'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductItem, InventoryCategory } from '@/types';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/icons/SocialIcons';
import {
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Search,
  Tag,
  Eye,
  EyeOff,
  ExternalLink,
  ImageIcon,
  Sparkles,
  AlertCircle,
  FolderTree
} from 'lucide-react';

interface ProductFormData {
  id?: string;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  brand_en: string;
  brand_ar: string;
  price_en: string;
  price_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  category: string;
  display_order: number;
  is_published: boolean;
  is_featured: boolean;
}

const defaultFormData: ProductFormData = {
  name_en: '',
  name_ar: '',
  slug_en: '',
  slug_ar: '',
  brand_en: 'Not specified',
  brand_ar: 'غير محدد',
  price_en: 'Price on Request',
  price_ar: 'السعر عند الطلب',
  description_en: '',
  description_ar: '',
  image_url: '',
  category: 'Accessories',
  display_order: 1,
  is_published: true,
  is_featured: false,
};

const CATEGORY_OPTIONS = [
  'Multimedia',
  'Window Tinting',
  'Lighting',
  'Accessories',
  'Security & Tracking',
  'Performance',
  'Interior Upgrades',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        fetch('/api/products?admin=true'),
        fetch('/api/categories'),
      ]);
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      if (dataProd.success && Array.isArray(dataProd.products)) {
        setProducts(dataProd.products);
      }
      if (dataCat.success && Array.isArray(dataCat.categories)) {
        setCategories(dataCat.categories);
      }
    } catch (err) {
      console.error('Failed to fetch products or categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableCategories = useMemo(() => {
    const list: { label: string; value: string }[] = [];
    categories.forEach((c) => {
      list.push({ label: `${c.name_en} (${c.name_ar})`, value: c.name_en });
    });
    // Include any existing product categories if not already present
    products.forEach((p) => {
      if (p.category && !list.some((l) => l.value.toLowerCase() === p.category?.toLowerCase())) {
        list.push({ label: p.category, value: p.category });
      }
    });
    return list;
  }, [categories, products]);

  const openAddModal = () => {
    setFormData({
      ...defaultFormData,
      display_order: products.length + 1,
    });
    setIsEditing(false);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setFormData({
      id: p.id,
      name_en: p.name_en || '',
      name_ar: p.name_ar || '',
      slug_en: p.slug_en || '',
      slug_ar: p.slug_ar || '',
      brand_en: p.brand_en || 'Not specified',
      brand_ar: p.brand_ar || 'غير محدد',
      price_en: p.price_en || 'Price on Request',
      price_ar: p.price_ar || 'السعر عند الطلب',
      description_en: p.description_en || '',
      description_ar: p.description_ar || '',
      image_url: p.image_url || '',
      category: p.category || 'Accessories',
      display_order: p.display_order || 1,
      is_published: p.is_published,
      is_featured: p.is_featured ?? false,
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
        throw new Error('Product Name (English) is required');
      }
      if (!formData.image_url.trim()) {
        throw new Error('Product Image URL is required');
      }
      if (!formData.description_en.trim()) {
        throw new Error('Description (English) is required');
      }

      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name_ar: formData.name_ar.trim() || formData.name_en.trim(),
          description_ar: formData.description_ar.trim() || formData.description_en.trim(),
          brand_ar: formData.brand_ar.trim() || (formData.brand_en === 'Not specified' ? 'غير محدد' : formData.brand_en),
          price_ar: formData.price_ar.trim() || (formData.price_en === 'Price on Request' ? 'السعر عند الطلب' : formData.price_en),
          image_url: normalizeGoogleDriveUrl(formData.image_url),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (data.errors ? data.errors.map((err: any) => err.message).join(', ') : 'Failed to save product'));
      }

      setSuccessMsg(isEditing ? 'Product updated successfully!' : 'New product created successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (p: ProductItem) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          is_published: !p.is_published,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === p.id ? { ...item, is_published: !p.is_published } : item
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle product status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSuccessMsg('Product deleted successfully');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name_en.toLowerCase().includes(q) ||
        p.name_ar.toLowerCase().includes(q) ||
        p.brand_en.toLowerCase().includes(q) ||
        p.brand_ar.toLowerCase().includes(q) ||
        p.description_en.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const previewNormalizedImage = normalizeGoogleDriveUrl(formData.image_url);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-display tracking-wide flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-brand-cyan" />
              <span>Product Catalogue Management</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
              {products.length} Items
            </span>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Manage public products, pricing, descriptions, and direct WhatsApp customer enquiry links.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-brand-deepNavy font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(91,192,222,0.3)] transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-navy border border-brand-steelBlue/40">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cyan/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, brand, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-deepNavy border border-brand-steelBlue/50 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-cyan"
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono tracking-wider transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-brand-cyan text-brand-deepNavy font-bold'
                : 'bg-brand-deepNavy text-gray-300 hover:text-white border border-brand-steelBlue/40'
            }`}
          >
            All ({products.length})
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono tracking-wider transition-all shrink-0 ${
                selectedCategory === cat.value
                  ? 'bg-brand-cyan text-brand-deepNavy font-bold'
                  : 'bg-brand-deepNavy text-gray-300 hover:text-white border border-brand-steelBlue/40'
              }`}
            >
              {cat.value}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table / Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
          <p className="text-xs font-mono text-gray-400">Loading product catalogue...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-brand-navy/30 border border-brand-steelBlue/30 rounded-2xl p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto opacity-40" />
          <h3 className="text-lg font-bold text-white font-display">No products found</h3>
          <p className="text-xs text-gray-400">
            {search ? 'Try clearing your search query.' : 'Click "Add New Product" above to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const previewImg = normalizeGoogleDriveUrl(p.image_url);
            const waTestUrl = `https://wa.me/971565694440?text=${encodeURIComponent(
              `Hello SpeederSpider! I would like to enquire about: ${p.name_en} (${p.brand_en})`
            )}`;

            return (
              <div
                key={p.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-steelBlue transition-all shadow-lg"
              >
                {/* Product Card Top: Image + Status Badges */}
                <div className="relative aspect-video w-full bg-brand-deepNavy p-4 flex items-center justify-center overflow-hidden border-b border-brand-steelBlue/30">
                  <Image
                    src={previewImg}
                    alt={p.name_en}
                    width={320}
                    height={180}
                    className="w-full h-full object-contain drop-shadow-md"
                    unoptimized
                  />

                  {/* Brand & Category badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand-deepNavy/90 backdrop-blur-md border border-brand-cyan/40 text-[10px] font-mono font-bold text-brand-cyan">
                      {p.brand_en}
                    </span>
                    {p.category && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-navy/90 border border-brand-steelBlue/60 text-[10px] font-mono text-gray-300">
                        {p.category}
                      </span>
                    )}
                  </div>

                  {/* Published Toggle Button */}
                  <button
                    onClick={() => handleTogglePublished(p)}
                    className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold transition-all shadow-md ${
                      p.is_published
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                    title={p.is_published ? 'Click to unpublish' : 'Click to publish'}
                  >
                    {p.is_published ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>

                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded bg-black/60">
                    Order: #{p.display_order}
                  </div>
                </div>

                {/* Product Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-bold text-white font-display leading-snug">
                        {p.name_en}
                      </h2>
                    </div>
                    {p.name_ar && (
                      <p className="text-xs text-brand-cyan/80 font-sans leading-relaxed" dir="rtl">
                        {p.name_ar}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 pt-1">
                      {p.description_en}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-brand-steelBlue/30">
                    {/* Price and Brand info */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400">Price:</span>
                      <span className="font-bold text-brand-cyan px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30">
                        {p.price_en}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={waTestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold transition-colors"
                        title="Test WhatsApp Enquiry Link"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp Link</span>
                      </a>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-gray-300 hover:text-brand-cyan hover:border-brand-cyan transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-gray-300 hover:text-rose-400 hover:border-rose-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl bg-brand-deepNavy border border-brand-steelBlue/60 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold font-display text-white">Delete Product</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete this product from the catalogue? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-brand-navy border border-brand-steelBlue/40"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-brand-deepNavy border border-brand-steelBlue/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  {isEditing ? 'Edit Product Item' : 'Add New Product to Catalogue'}
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  SpeederSpider Dubai Store & Upgrades
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

            <form onSubmit={handleSave} className="space-y-6 mt-6">
              {/* Product Names: English & Arabic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g. Car Play Box"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Product Name (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="مثال: صندوق تشغيل السيارة"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Brand: English & Arabic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Brand (English)
                  </label>
                  <input
                    type="text"
                    value={formData.brand_en}
                    onChange={(e) => setFormData({ ...formData, brand_en: e.target.value })}
                    placeholder="e.g. 3M, GMC, Ford, Not specified"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Brand (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.brand_ar}
                    onChange={(e) => setFormData({ ...formData, brand_ar: e.target.value })}
                    placeholder="مثال: 3M، جي إم سي، غير محدد"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Price: English & Arabic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Price Label (English)
                  </label>
                  <input
                    type="text"
                    value={formData.price_en}
                    onChange={(e) => setFormData({ ...formData, price_en: e.target.value })}
                    placeholder="e.g. Price on Request or AED 850"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Price Label (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.price_ar}
                    onChange={(e) => setFormData({ ...formData, price_ar: e.target.value })}
                    placeholder="مثال: السعر عند الطلب"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Description (English) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Provide detailed features, compatibility and specs..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">
                    Description (Arabic)
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    placeholder="الوصف بالعربية..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase flex items-center justify-between">
                    <span>Product Image URL * (Google Drive link or direct URL)</span>
                    <span className="text-brand-cyan font-normal text-[11px]">Auto-normalized for fast CDN streaming</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... or direct image link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan font-mono text-xs"
                  />
                </div>

                {previewNormalizedImage && (
                  <div className="p-3 rounded-xl bg-brand-navy border border-brand-steelBlue/40 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <Image
                        src={previewNormalizedImage}
                        alt="Preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live Preview Ready</span>
                      </p>
                      <p className="font-mono text-[11px] text-gray-400 break-all line-clamp-1">
                        CDN URL: {previewNormalizedImage}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Category, Display Order, Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-300 uppercase">Category</label>
                    <Link
                      href="/admin/categories"
                      target="_blank"
                      className="text-[10px] text-brand-cyan hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>+ Categories</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  >
                    {availableCategories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300 uppercase">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-brand-navy border border-brand-steelBlue/50">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-cyan focus:ring-0 bg-brand-deepNavy border-brand-steelBlue"
                    />
                    <span className="text-xs font-semibold text-white">Publish on Live Website</span>
                  </label>
                </div>
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
                  <span>{saving ? 'Saving Product...' : isEditing ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
