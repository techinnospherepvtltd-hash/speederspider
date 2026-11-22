'use client';

import React, { useState } from 'react';
import { ContactMessage, EnquiryStatus } from '@/types';
import { Mail, Search, MessageSquare, Phone, Check, Clock, Archive, X } from 'lucide-react';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ContactMessage[]>([
    {
      id: 'enq-1',
      customer_name: 'Rashid Al-Falasi',
      email: 'rashid.f@example.ae',
      phone: '+971 50 882 1923',
      service_id: 's1-upholstery',
      message: 'Looking to re-trim my 2022 Porsche 911 GT3 seats with black Alcantara and guards red stitching. Please share availability and estimated turnaround time.',
      preferred_language: 'en',
      status: 'new',
      internal_notes: 'Initial quotation requested. Follow up scheduled.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'enq-2',
      customer_name: 'Tareq Mansoor',
      email: 'tareq.m@example.com',
      phone: '+971 55 319 4410',
      service_id: 's3-tinting',
      message: 'استفسار عن تظليل عازل حراري نانو سيراميك لسيارة رنج روفر أوتوبيوغرافي، هل العازل يشمل فتحة البانوراما؟',
      preferred_language: 'ar',
      status: 'in_progress',
      internal_notes: 'Quotation of AED 2,200 sent via WhatsApp. Client confirmed appointment for Thursday.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactMessage | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, newStatus: EnquiryStatus) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus, updated_at: new Date().toISOString() } : e))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
  };

  const handleSaveNote = () => {
    if (!selectedEnquiry) return;
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === selectedEnquiry.id
          ? { ...e, internal_notes: noteInput, updated_at: new Date().toISOString() }
          : e
      )
    );
    setSelectedEnquiry({ ...selectedEnquiry, internal_notes: noteInput });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
            <Mail className="w-6 h-6 text-brand-cyan" />
            Customer Contact Enquiries
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Incoming consultation requests, lead management, and workshop internal notes
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-brand-navy border border-brand-steelBlue/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search customer name, phone, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['all', 'new', 'in_progress', 'contacted', 'completed', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-brand-cyan text-brand-deepNavy font-bold'
                  : 'bg-brand-deepNavy text-gray-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List */}
      <div className="space-y-3">
        {filteredEnquiries.map((enq) => (
          <div
            key={enq.id}
            onClick={() => {
              setSelectedEnquiry(enq);
              setNoteInput(enq.internal_notes || '');
            }}
            className="p-5 rounded-xl bg-brand-navy border border-brand-steelBlue/40 hover:border-brand-cyan/60 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white font-mono text-sm">{enq.customer_name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                  enq.status === 'new'
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
                    : enq.status === 'in_progress'
                    ? 'bg-brand-amber/20 text-brand-amber border border-brand-amber/40'
                    : enq.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {enq.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  Language: {enq.preferred_language.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-300 line-clamp-2 max-w-3xl">
                {enq.message}
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-cyan" />
                  {enq.phone}
                </span>
                <span>{enq.email}</span>
                <span>• {new Date(enq.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEnquiry(enq);
                  setNoteInput(enq.internal_notes || '');
                }}
                className="px-3 py-1.5 rounded bg-brand-deepNavy border border-brand-steelBlue text-xs font-mono text-brand-cyan hover:border-brand-cyan"
              >
                View & Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enquiry Detail & Internal Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <div>
                <h2 className="text-lg font-bold text-white font-display uppercase">
                  Enquiry: {selectedEnquiry.customer_name}
                </h2>
                <p className="text-xs font-mono text-gray-400">
                  Received: {new Date(selectedEnquiry.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-brand-deepNavy border border-brand-steelBlue/30 text-xs font-mono">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Phone</span>
                <a href={`tel:${selectedEnquiry.phone}`} className="text-brand-cyan font-bold hover:underline">
                  {selectedEnquiry.phone}
                </a>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Email</span>
                <span className="text-white">{selectedEnquiry.email}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Customer Message</label>
              <div className="p-4 rounded-xl bg-brand-deepNavy border border-brand-steelBlue/30 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Change Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['new', 'in_progress', 'contacted', 'completed', 'archived'] as EnquiryStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateStatus(selectedEnquiry.id, st)}
                    className={`py-1.5 text-xs font-mono uppercase font-bold rounded border transition-colors ${
                      selectedEnquiry.status === st
                        ? 'bg-brand-cyan text-brand-deepNavy border-brand-cyan'
                        : 'bg-brand-deepNavy text-gray-400 border-brand-steelBlue/40 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-gray-400">Internal Workshop Notes</label>
              <textarea
                rows={3}
                placeholder="Log VIN, quotation amount, or callback notes..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-sm text-white focus:border-brand-cyan"
              />
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded hover:bg-brand-cyan/90 transition-colors"
              >
                Save Internal Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
