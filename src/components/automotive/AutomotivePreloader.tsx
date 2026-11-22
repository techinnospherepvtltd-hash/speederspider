'use client';

import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  lang: 'en' | 'ar';
}

export function AutomotivePreloader({ lang }: PreloaderProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [rpm, setRpm] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setVisible(false);
      return;
    }

    // RPM acceleration simulation
    const interval = setInterval(() => {
      setRpm((prev) => {
        if (prev >= 7800) {
          clearInterval(interval);
          return 7800;
        }
        return prev + 650;
      });
    }, 70);

    // Timeout fallback to ensure user is NEVER trapped
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted || !visible) return null;

  const isRtl = lang === 'ar';

  return (
    <div
      id="preloader"
      aria-hidden="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-deepNavy text-white transition-opacity duration-500 ease-out"
    >
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1C2541_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative flex flex-col items-center px-6">
        {/* Speedometer Gauge HUD Visual */}
        <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-steelBlue/30 border-t-brand-cyan animate-spin" style={{ animationDuration: '2s' }} />
          {/* Inner Telemetry Ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-brand-cyan/40" />

          {/* RPM Display */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl font-extrabold tracking-wider text-brand-cyan">
              {rpm.toLocaleString()}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-brand-warmBeige font-mono">
              RPM • TELEMETRY
            </span>
          </div>
        </div>

        {/* Brand Name with Cyan Accent */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold tracking-widest text-white uppercase font-display">
            SPEEDER
          </span>
          <span className="text-2xl font-bold tracking-widest text-brand-cyan uppercase font-display">
            SPIDER
          </span>
        </div>

        {/* Location & Status Line */}
        <p className="text-xs tracking-wider uppercase text-gray-400 font-mono flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {isRtl ? 'دبي • فحص الأنظمة الحيوية' : 'DUBAI • WORKSHOP SYSTEMS READY'}
        </p>

        {/* Horizontal Speed Bar */}
        <div className="w-56 h-1 mt-6 bg-brand-navy rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-steelBlue via-brand-cyan to-brand-warmBeige transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, (rpm / 7800) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
