'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@speederspider.com');
  const [password, setPassword] = useState('Speeder@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Invalid email or password. Please verify credentials.');
          setLoading(false);
          return;
        }

        const role = (data.user?.user_metadata?.role as UserRole) || 'owner';

        document.cookie = `admin_role=${role}; path=/; max-age=86400`;
        localStorage.setItem('admin_role', role);
        localStorage.setItem('admin_email', data.user?.email || email);

        router.push('/admin');
      } else {
        // Local preview fallback
        document.cookie = `admin_role=owner; path=/; max-age=86400`;
        localStorage.setItem('admin_role', 'owner');
        localStorage.setItem('admin_email', email);
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
      setLoading(false);
    }
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

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

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
                placeholder="owner@speederspider.com"
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
                placeholder="••••••••••••"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="p-3 bg-brand-deepNavy/80 border border-brand-steelBlue/30 rounded-lg text-[11px] text-gray-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-brand-cyan font-mono uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Full Owner Authorization</span>
            </div>
            <p className="text-gray-400">
              Credentials are authenticated live via Supabase Auth with full OWNER authority across all workshop modules.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all shadow-[0_0_20px_rgba(91,192,222,0.4)] disabled:opacity-50"
          >
            {loading ? 'Authenticating with Supabase...' : 'Sign In as Owner'}
          </button>
        </form>
      </div>
    </div>
  );
}
