'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, UserCheck } from 'lucide-react';
import { UserRole } from '@/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@speederspider.com');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<UserRole>('owner');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save active admin session to document cookie and localStorage for demo/testing
    document.cookie = `admin_role=${role}; path=/; max-age=86400`;
    localStorage.setItem('admin_role', role);
    localStorage.setItem('admin_email', email);

    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-brand-deepNavy flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-navy border border-brand-steelBlue/40 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-block relative w-40 sm:w-48 h-auto mx-auto mb-1">
            <Image
              src="/images/speederspider-shield-full.webp"
              alt="SpeederSpider Dubai"
              width={192}
              height={138}
              className="w-full h-auto object-contain drop-shadow-[0_4px_25px_rgba(91,192,222,0.35)]"
              priority
            />
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400">
            INTERNAL WORKSHOP MANAGEMENT PORTAL
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-white text-sm focus:outline-none focus:border-brand-cyan"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-white text-sm focus:outline-none focus:border-brand-cyan"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Role Selection for testing multi-role authorization */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono mb-1.5">
              Simulated Role Authentication
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['owner', 'manager', 'staff'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setEmail(`${r}@speederspider.com`);
                  }}
                  className={`py-2 text-xs font-mono uppercase font-bold rounded-lg border transition-all ${
                    role === r
                      ? 'bg-brand-cyan text-brand-deepNavy border-brand-cyan shadow-[0_0_10px_rgba(91,192,222,0.5)]'
                      : 'bg-brand-deepNavy text-gray-400 border-brand-steelBlue/40 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all shadow-[0_0_20px_rgba(91,192,222,0.4)]"
          >
            {loading ? 'Authenticating...' : `Sign In as ${role.toUpperCase()}`}
          </button>
        </form>

        <div className="p-3 bg-brand-deepNavy/80 border border-brand-steelBlue/30 rounded-lg text-[11px] text-gray-400 space-y-1">
          <p className="font-semibold text-brand-warmBeige flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Role Access Preview:
          </p>
          <p>• <strong>OWNER:</strong> Full authority, security logs, user provisioning.</p>
          <p>• <strong>MANAGER:</strong> Content CRUD, stock management, customer enquiries.</p>
          <p>• <strong>STAFF:</strong> Stock-in/stock-out, update enquiry notes only.</p>
        </div>
      </div>
    </div>
  );
}
