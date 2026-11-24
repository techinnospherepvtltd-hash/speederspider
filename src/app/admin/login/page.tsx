'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if session is already active
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated) {
          const redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin';
          router.replace(redirect);
          return;
        }
      } catch {
        // Continue to login
      } finally {
        setCheckingSession(false);
      }
    }
    checkExistingSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Read redirect destination from query parameters
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin';
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-brand-deepNavy flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
          <p className="text-xs font-mono text-gray-400">Verifying Workshop Security Session...</p>
        </div>
      </div>
    );
  }

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

          <div className="p-3 bg-brand-deepNavy/80 border border-brand-steelBlue/30 rounded-lg text-[11px] text-gray-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-brand-cyan font-mono uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Protected Workshop Session</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('owner@speederspider.com');
                  setPassword('Speeder@1234');
                }}
                className="text-[10px] font-mono text-brand-cyan/80 hover:text-brand-cyan underline transition-colors"
              >
                Use Owner Default
              </button>
            </div>
            <p className="text-gray-400">
              Signs an HTTP-only SameSite session cookie with 24-hour validity and 4-hour sliding idle protection.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all shadow-[0_0_20px_rgba(91,192,222,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying & Issuing Session...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
