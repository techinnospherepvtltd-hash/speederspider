import React from 'react';
import Link from 'next/link';
import {
  getAllServicesAdmin,
  getProjects,
  getEnquiries,
  getInventoryItems
} from '@/lib/data/db';
import {
  Wrench,
  ImageIcon,
  Mail,
  Boxes,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { AdminSettingsCard } from '@/components/admin/AdminSettingsCard';

export default async function AdminDashboardPage() {
  const services = await getAllServicesAdmin();
  const projects = await getProjects();
  const enquiries = await getEnquiries();
  const inventory = await getInventoryItems();

  const publishedServices = services.filter((s) => s.is_published).length;
  const publishedProjects = projects.filter((p) => p.is_published).length;
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const lowStockItems = inventory.filter((item) => item.quantity <= item.min_threshold);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-display tracking-wide">
            Workshop Management Operations
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            SpeederSpider Dubai Atelier • Live System Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-gray-300 uppercase">
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Low-Stock Critical Alert Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-brand-amber/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-amber/20 text-brand-amber shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                Low-Stock Workshop Alert ({lowStockItems.length} items below minimum threshold)
              </h2>
              <p className="text-xs text-gray-300">
                Action required: Restock materials to prevent workshop delays.
              </p>
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-amber hover:bg-brand-amber/90 rounded-lg transition-colors whitespace-nowrap"
          >
            Review Inventory
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Services */}
        <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Services</span>
            <div className="p-2 rounded-lg bg-brand-deepNavy text-brand-cyan">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-white">{services.length}</p>
            <p className="text-xs text-gray-400 mt-1">{publishedServices} published on public website</p>
          </div>
          <Link
            href="/admin/services"
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1 pt-2 border-t border-brand-steelBlue/30"
          >
            <span>Manage Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 2: Portfolio Projects */}
        <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Showcase Projects</span>
            <div className="p-2 rounded-lg bg-brand-deepNavy text-brand-cyan">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-white">{projects.length}</p>
            <p className="text-xs text-gray-400 mt-1">{publishedProjects} published with Before/After</p>
          </div>
          <Link
            href="/admin/portfolio"
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1 pt-2 border-t border-brand-steelBlue/30"
          >
            <span>Manage Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 3: Contact Enquiries */}
        <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Customer Enquiries</span>
            <div className="p-2 rounded-lg bg-brand-deepNavy text-brand-cyan">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-white">{enquiries.length}</p>
            <p className="text-xs text-brand-cyan mt-1 font-semibold">{newEnquiries} awaiting review</p>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1 pt-2 border-t border-brand-steelBlue/30"
          >
            <span>View Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 4: Internal Inventory */}
        <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Inventory Items</span>
            <div className="p-2 rounded-lg bg-brand-deepNavy text-brand-cyan">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-white">{inventory.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {lowStockItems.length > 0 ? (
                <span className="text-brand-amber font-semibold">{lowStockItems.length} low stock warnings</span>
              ) : (
                <span className="text-emerald-400">Stock levels healthy</span>
              )}
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1 pt-2 border-t border-brand-steelBlue/30"
          >
            <span>Workshop Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Two-Column Overview: Low-Stock Breakdown & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low-Stock Item List */}
        <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-steelBlue/30">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brand-amber" />
              Low-Stock Supplies Alert
            </h2>
            <Link href="/admin/inventory" className="text-xs font-mono text-brand-cyan hover:underline">
              View All
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              All inventory items currently meet or exceed their minimum threshold.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-brand-deepNavy/80 border border-brand-steelBlue/30 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{item.name_en}</p>
                    <p className="text-[11px] font-mono text-gray-400">SKU: {item.sku} • Supplier: {item.supplier || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-brand-amber/20 text-brand-amber border border-brand-amber/40 text-xs font-mono font-bold">
                      {item.quantity} / {item.min_threshold} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enquiries Preview */}
        <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-steelBlue/30">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-cyan" />
              Recent Contact Enquiries
            </h2>
            <Link href="/admin/enquiries" className="text-xs font-mono text-brand-cyan hover:underline">
              View All
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-gray-400">No customer messages received yet.</p>
              <p className="text-[11px] text-gray-500 font-mono">Submissions from the public contact form will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.slice(0, 4).map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="p-3 rounded-lg bg-brand-deepNavy/80 border border-brand-steelBlue/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white font-mono">{enquiry.customer_name}</p>
                    <p className="text-gray-400">{enquiry.phone} • {enquiry.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    enquiry.status === 'new'
                      ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
                      : 'bg-gray-800 text-gray-300'
                  }`}>
                    {enquiry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Business Profile & Review URL Settings */}
      <AdminSettingsCard />
    </div>
  );
}
