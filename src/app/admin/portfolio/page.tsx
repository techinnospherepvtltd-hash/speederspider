'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PortfolioProject } from '@/types';
import { INITIAL_PROJECTS } from '@/lib/data/mock-data';
import { Plus, Edit, Eye, EyeOff, Star, X } from 'lucide-react';

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>(INITIAL_PROJECTS);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  const togglePublish = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_published: !p.is_published } : p))
    );
  };

  const toggleFeatured = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_featured: !p.is_featured } : p))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === editingProject.id ? editingProject : p))
    );
    setEditingProject(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display">
            Portfolio & Showcase Management
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Manage completed projects, Before & After paired imagery, and featured transformations
          </p>
        </div>

        <button
          onClick={() => {
            const newP: PortfolioProject = {
              id: 'p-' + Date.now(),
              slug: 'new-showcase-project',
              title_en: 'New Vehicle Transformation',
              title_ar: 'مشروع تعديل جديد',
              desc_en: 'Full scope of work description.',
              desc_ar: 'وصف نطاق العمل المنجز.',
              vehicle_make: 'Porsche',
              vehicle_model: '911',
              vehicle_year: '2024',
              before_image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
              after_image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
              gallery_images: [],
              is_featured: false,
              is_published: true,
              display_order: projects.length + 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setProjects([...projects, newP]);
            setEditingProject(newP);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-xl overflow-hidden bg-brand-navy border border-brand-steelBlue/40 flex flex-col justify-between"
          >
            <div className="relative h-44 w-full bg-brand-deepNavy">
              <Image
                src={project.after_image}
                alt={project.title_en}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <button
                  onClick={() => toggleFeatured(project.id)}
                  className={`p-1.5 rounded backdrop-blur-md transition-colors ${
                    project.is_featured
                      ? 'bg-brand-amber text-brand-deepNavy font-bold'
                      : 'bg-brand-deepNavy/80 text-gray-400 hover:text-brand-amber'
                  }`}
                  title={project.is_featured ? 'Featured on Homepage' : 'Mark as Featured'}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-deepNavy/90 text-brand-warmBeige border border-brand-steelBlue/50">
                  {project.vehicle_make} {project.vehicle_model}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display leading-snug">
                  {project.title_en}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                  {project.desc_en}
                </p>
              </div>

              <div className="pt-3 border-t border-brand-steelBlue/30 flex items-center justify-between text-xs">
                <button
                  onClick={() => togglePublish(project.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    project.is_published
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {project.is_published ? 'Published' : 'Draft'}
                </button>

                <button
                  onClick={() => setEditingProject(project)}
                  className="flex items-center gap-1 text-brand-cyan hover:underline font-mono text-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase">
                Edit Showcase: {editingProject.title_en}
              </h2>
              <button
                onClick={() => setEditingProject(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title_en}
                    onChange={(e) => setEditingProject({ ...editingProject, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Title (AR)</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={editingProject.title_ar}
                    onChange={(e) => setEditingProject({ ...editingProject, title_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Before Image URL</label>
                  <input
                    type="text"
                    required
                    value={editingProject.before_image}
                    onChange={(e) => setEditingProject({ ...editingProject, before_image: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">After Image URL</label>
                  <input
                    type="text"
                    required
                    value={editingProject.after_image}
                    onChange={(e) => setEditingProject({ ...editingProject, after_image: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>

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
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded hover:bg-brand-cyan/90 transition-colors"
                >
                  Save Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
