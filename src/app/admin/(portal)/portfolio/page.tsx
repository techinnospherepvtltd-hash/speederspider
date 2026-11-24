'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PortfolioProject } from '@/types';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  Star,
  X,
  Trash2,
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ImageIcon
} from 'lucide-react';

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<PortfolioProject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const initialProjectState: Omit<PortfolioProject, 'id' | 'created_at' | 'updated_at'> = {
    slug: '',
    title_en: '',
    title_ar: '',
    short_desc_en: '',
    short_desc_ar: '',
    desc_en: '',
    desc_ar: '',
    vehicle_make: 'Porsche',
    vehicle_model: '911 GT3',
    vehicle_year: '2024',
    service_id: null,
    before_image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    after_image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [],
    is_featured: false,
    is_published: true,
    display_order: 1,
    seo_title_en: '',
    seo_title_ar: '',
    seo_desc_en: '',
    seo_desc_ar: '',
  };

  const [formData, setFormData] = useState(initialProjectState);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load portfolio projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      ...initialProjectState,
      slug: 'project-' + Math.random().toString(36).substring(2, 7),
      display_order: projects.length + 1,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    const payload = {
      ...formData,
      service_id: formData.service_id && formData.service_id.length > 20 ? formData.service_id : null,
      before_image: normalizeGoogleDriveUrl(formData.before_image),
      after_image: normalizeGoogleDriveUrl(formData.after_image),
      gallery_images: (formData.gallery_images || []).map(normalizeGoogleDriveUrl),
    };

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.errors?.[0]?.message || data.message || 'Failed to create project');
        setIsSaving(false);
        return;
      }

      setProjects((prev) => [data.project, ...prev]);
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError('Network error while saving project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setFormError('');
    setIsSaving(true);

    const payload = {
      ...editingProject,
      service_id: editingProject.service_id && editingProject.service_id.length > 20 ? editingProject.service_id : null,
      before_image: normalizeGoogleDriveUrl(editingProject.before_image),
      after_image: normalizeGoogleDriveUrl(editingProject.after_image),
      gallery_images: (editingProject.gallery_images || []).map(normalizeGoogleDriveUrl),
    };

    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to update project');
        setIsSaving(false);
        return;
      }

      setProjects((prev) => prev.map((p) => (p.id === data.project.id ? data.project : p)));
      setEditingProject(null);
    } catch (err) {
      setFormError('Network error while updating project');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (project: PortfolioProject) => {
    const updatedStatus = !project.is_published;
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, is_published: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, is_published: updatedStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const toggleFeatured = async (project: PortfolioProject) => {
    const updatedFeatured = !project.is_featured;
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, is_featured: updatedFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, is_featured: updatedFeatured } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmProject(null);
      }
    } catch (err) {
      alert('Network error while deleting project');
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title_en.toLowerCase().includes(search.toLowerCase()) ||
      p.title_ar.includes(search) ||
      (p.vehicle_make && p.vehicle_make.toLowerCase().includes(search.toLowerCase())) ||
      (p.vehicle_model && p.vehicle_model.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-brand-cyan" />
            Portfolio & Showcase Management
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Manage completed transformations, Before & After paired imagery, short/full descriptions, and SEO metadata
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors shadow-[0_0_15px_rgba(91,192,222,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl bg-brand-navy border border-brand-steelBlue/40 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search projects by vehicle, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <p className="text-xs font-mono text-gray-400">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
        </p>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
          <span className="text-xs font-mono">Loading showcase portfolio...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-sm font-bold text-white uppercase font-display">No showcase projects found</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded-lg hover:bg-brand-cyan/90"
          >
            Create First Showcase Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl overflow-hidden bg-brand-navy border border-brand-steelBlue/40 flex flex-col justify-between hover:border-brand-cyan/50 transition-colors shadow-lg"
            >
              {/* Thumbnail Container with Split Indicator */}
              <div className="relative h-48 w-full bg-brand-deepNavy">
                <Image
                  src={project.after_image}
                  alt={project.title_en}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-black/30" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFeatured(project)}
                    className={`p-1.5 rounded backdrop-blur-md transition-colors ${
                      project.is_featured
                        ? 'bg-brand-amber text-brand-deepNavy font-bold shadow-[0_0_10px_rgba(217,119,6,0.5)]'
                        : 'bg-brand-deepNavy/80 text-gray-400 hover:text-brand-amber'
                    }`}
                    title={project.is_featured ? 'Featured on Homepage' : 'Mark as Featured'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-deepNavy/90 text-brand-warmBeige border border-brand-steelBlue/50">
                    {project.vehicle_make} {project.vehicle_model} {project.vehicle_year && `(${project.vehicle_year})`}
                  </span>
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-gray-300">
                  <span className="bg-brand-deepNavy/80 px-2 py-0.5 rounded border border-brand-steelBlue/40">
                    Slug: /{project.slug}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-display leading-snug">
                    {project.title_en}
                  </h3>
                  <p className="text-xs text-brand-cyan font-arabic mt-0.5" dir="rtl">
                    {project.title_ar}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                    {project.short_desc_en || project.desc_en}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-steelBlue/30 flex items-center justify-between text-xs">
                  <button
                    onClick={() => togglePublish(project)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-colors ${
                      project.is_published
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {project.is_published ? 'Published' : 'Draft'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setFormError('');
                      }}
                      className="flex items-center gap-1 text-brand-cyan hover:underline font-mono text-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmProject(project)}
                      className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. ADD PROJECT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-cyan" />
                Add Showcase Project
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Slug (URL identifier) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    value={formData.vehicle_make || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Vehicle Model & Year</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Model"
                      value={formData.vehicle_model || ''}
                      onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                      className="w-2/3 px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={formData.vehicle_year || ''}
                      onChange={(e) => setFormData({ ...formData, vehicle_year: e.target.value })}
                      className="w-1/3 px-2 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>
              </div>

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

              {/* Short Descriptions for Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Short Summary (English - shown on cards)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.short_desc_en || ''}
                    onChange={(e) => setFormData({ ...formData, short_desc_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Short Summary (Arabic - shown on cards)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={formData.short_desc_ar || ''}
                    onChange={(e) => setFormData({ ...formData, short_desc_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Full Detailed Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Full Description (English) <span className="text-brand-cyan">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.desc_en}
                    onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
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
                    value={formData.desc_ar}
                    onChange={(e) => setFormData({ ...formData, desc_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Before & After Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-gray-300">
                      Before Image URL <span className="text-brand-cyan">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://... or Google Drive share link"
                    value={formData.before_image}
                    onChange={(e) => setFormData({ ...formData, before_image: normalizeGoogleDriveUrl(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                  {formData.before_image && (
                    <div className="relative h-28 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                      <Image
                        src={formData.before_image}
                        alt="Before Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 left-2 text-[10px] font-mono uppercase bg-black/70 px-1.5 py-0.5 rounded text-white">
                        Before Preview
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-gray-300">
                      After Image URL <span className="text-brand-cyan">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://... or Google Drive share link"
                    value={formData.after_image}
                    onChange={(e) => setFormData({ ...formData, after_image: normalizeGoogleDriveUrl(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                  {formData.after_image && (
                    <div className="relative h-28 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                      <Image
                        src={formData.after_image}
                        alt="After Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 left-2 text-[10px] font-mono uppercase bg-black/70 px-1.5 py-0.5 rounded text-white">
                        After Preview
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Metadata Accordion/Fields */}
              <div className="p-4 rounded-xl bg-brand-deepNavy/60 border border-brand-steelBlue/30 space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan">
                  Technical SEO Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">SEO Title (EN)</label>
                    <input
                      type="text"
                      placeholder="Custom page title tag"
                      value={formData.seo_title_en || ''}
                      onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">SEO Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="عنوان السيو المخصص"
                      value={formData.seo_title_ar || ''}
                      onChange={(e) => setFormData({ ...formData, seo_title_ar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic"
                    />
                  </div>
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
                    <span>Create Showcase Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT PROJECT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-cyan" />
                Edit Showcase: {editingProject.title_en}
              </h2>
              <button
                onClick={() => setEditingProject(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    value={editingProject.vehicle_make || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, vehicle_make: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Vehicle Model & Year</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Model"
                      value={editingProject.vehicle_model || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, vehicle_model: e.target.value })}
                      className="w-2/3 px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={editingProject.vehicle_year || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, vehicle_year: e.target.value })}
                      className="w-1/3 px-2 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title_en}
                    onChange={(e) => setEditingProject({ ...editingProject, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={editingProject.title_ar}
                    onChange={(e) => setEditingProject({ ...editingProject, title_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white text-right font-arabic"
                  />
                </div>
              </div>

              {/* Short Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Short Summary (EN)</label>
                  <textarea
                    rows={2}
                    value={editingProject.short_desc_en || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, short_desc_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Short Summary (AR)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={editingProject.short_desc_ar || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, short_desc_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic"
                  />
                </div>
              </div>

              {/* Full Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Full Description (EN)</label>
                  <textarea
                    rows={4}
                    required
                    value={editingProject.desc_en}
                    onChange={(e) => setEditingProject({ ...editingProject, desc_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Full Description (AR)</label>
                  <textarea
                    rows={4}
                    required
                    dir="rtl"
                    value={editingProject.desc_ar}
                    onChange={(e) => setEditingProject({ ...editingProject, desc_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic"
                  />
                </div>
              </div>

              {/* Before & After Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-gray-300">Before Image URL</label>
                    <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://... or Google Drive share link"
                    value={editingProject.before_image}
                    onChange={(e) => setEditingProject({ ...editingProject, before_image: normalizeGoogleDriveUrl(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white"
                  />
                  {editingProject.before_image && (
                    <div className="relative h-28 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                      <Image
                        src={editingProject.before_image}
                        alt="Before Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-gray-300">After Image URL</label>
                    <span className="text-[10px] font-mono text-brand-cyan/80">Drive links supported</span>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://... or Google Drive share link"
                    value={editingProject.after_image}
                    onChange={(e) => setEditingProject({ ...editingProject, after_image: normalizeGoogleDriveUrl(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white"
                  />
                  {editingProject.after_image && (
                    <div className="relative h-28 w-full rounded overflow-hidden border border-brand-steelBlue/40">
                      <Image
                        src={editingProject.after_image}
                        alt="After Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Technical SEO Metadata */}
              <div className="p-4 rounded-xl bg-brand-deepNavy/60 border border-brand-steelBlue/30 space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan">
                  Technical SEO Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">SEO Title (EN)</label>
                    <input
                      type="text"
                      value={editingProject.seo_title_en || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, seo_title_en: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">SEO Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={editingProject.seo_title_ar || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, seo_title_ar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white text-right font-arabic"
                    />
                  </div>
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
                  onClick={() => setEditingProject(null)}
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
                    <span>Update Showcase</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-navy border border-red-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-base font-bold uppercase font-display text-white">Confirm Project Deletion</h2>
            </div>
            <p className="text-xs text-gray-300">
              Are you sure you want to remove <span className="text-white font-bold">{deleteConfirmProject.title_en}</span> from the showcase portfolio?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-steelBlue/30">
              <button
                type="button"
                onClick={() => setDeleteConfirmProject(null)}
                className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProject(deleteConfirmProject.id)}
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
