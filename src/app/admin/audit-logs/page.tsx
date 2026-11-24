'use client';

import React, { useState, useEffect } from 'react';
import { AuditLog, UserRole } from '@/types';
import { ShieldAlert, Lock, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessionAndLogs = async () => {
    try {
      // 1. Verify Session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();

      if (!sessionData.authenticated) {
        window.location.href = '/admin/login?redirect=/admin/audit-logs';
        return;
      }

      setRole(sessionData.user.role);

      if (sessionData.user.role === 'owner') {
        // 2. Fetch live audit logs
        const logsRes = await fetch('/api/audit-logs');
        const logsData = await logsRes.json();
        if (logsData.success) {
          setLogs(logsData.logs || []);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessionAndLogs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessionAndLogs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
          <p className="text-xs font-mono text-gray-400">Verifying Owner Credentials & Decrypting Logs...</p>
        </div>
      </div>
    );
  }

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
          Security audit logs and sensitive platform configuration are exclusively accessible to verified platform Owners.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-cyan" />
            Platform Security & Audit Logs
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Immutable live event log for administrative actions, inventory movements, and privilege changes
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-navy border border-brand-steelBlue/40 text-xs text-gray-300 hover:text-white hover:border-brand-cyan/60 transition-all font-mono self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-cyan' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
        </button>
      </div>

      <div className="rounded-xl border border-brand-steelBlue/40 bg-brand-navy overflow-hidden shadow-xl">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs font-mono">
            No audit events recorded yet. Administrative operations will automatically stream here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 font-mono">
              <thead className="bg-brand-deepNavy/80 text-[11px] uppercase text-gray-400 border-b border-brand-steelBlue/30">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steelBlue/20">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-deepNavy/40 transition-colors">
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded border font-bold text-[10px] ${
                          log.action.includes('LOGIN')
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                            : log.action.includes('FAILED')
                            ? 'bg-red-950/60 text-red-400 border-red-500/40'
                            : log.action.includes('DELETE')
                            ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                            : 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">
                      {log.entity_id || log.entity_type}
                    </td>
                    <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
