'use client';

import React, { useState, useEffect } from 'react';
import { AuditLog, UserRole } from '@/types';
import { ShieldAlert, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [role, setRole] = useState<UserRole>('owner');

  useEffect(() => {
    const storedRole = (localStorage.getItem('admin_role') as UserRole) || 'owner';
    setRole(storedRole);
  }, []);

  const logs: AuditLog[] = [
    {
      id: 'log-1',
      action: 'STOCK_OUT',
      entity_type: 'inventory_items',
      entity_id: 'inv-2 (9H Ceramic Kit)',
      details: { qty: -2, reason: 'Porsche 911 GT3 Job', performed_by: 'Staff Workshop' },
      ip_address: '192.168.1.42',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'log-2',
      action: 'SERVICE_UPDATE',
      entity_type: 'services',
      entity_id: 's1-upholstery',
      details: { field: 'featured_image', updated_by: 'manager@speederspider.com' },
      ip_address: '192.168.1.15',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'log-3',
      action: 'ADMIN_LOGIN',
      entity_type: 'auth',
      entity_id: 'owner@speederspider.com',
      details: { status: 'SUCCESS_2FA_VERIFIED' },
      ip_address: '86.98.112.54',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  if (role !== 'owner') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white uppercase font-display">
          Access Restricted: OWNER Authority Required
        </h1>
        <p className="text-xs text-gray-400">
          Security audit logs and sensitive platform configuration are exclusively accessible to the platform Owner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-brand-steelBlue/30">
        <h1 className="text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-cyan" />
          Platform Security & Audit Logs
        </h1>
        <p className="text-xs font-mono text-gray-400 mt-1">
          Immutable event log for administrative actions, inventory movements, and privilege changes
        </p>
      </div>

      <div className="rounded-xl border border-brand-steelBlue/40 bg-brand-navy overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300 font-mono">
          <thead className="bg-brand-deepNavy/80 text-[11px] uppercase text-gray-400 border-b border-brand-steelBlue/30">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">Audit Details</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-steelBlue/20">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-brand-deepNavy/40 transition-colors">
                <td className="py-3 px-4 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-white font-semibold">{log.entity_id}</td>
                <td className="py-3 px-4 text-gray-300">
                  {JSON.stringify(log.details)}
                </td>
                <td className="py-3 px-4 text-gray-500">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
