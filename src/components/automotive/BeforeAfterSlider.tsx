'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { parseGoogleDriveUrl } from '@/lib/media/drive';
import { Sliders } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: '16/9' | '4/3' | '3/2';
  className?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before automotive transformation",
  afterAlt = "After automotive transformation",
  beforeLabel = "Before",
  afterLabel = "After",
  aspectRatio = '16/9',
  className = '',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanBefore = parseGoogleDriveUrl(beforeImage);
  const cleanAfter = parseGoogleDriveUrl(afterImage);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let pos = (x / rect.width) * 100;
      if (pos < 0) pos = 0;
      if (pos > 100) pos = 100;
      setSliderPosition(pos);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent accidental vertical page scroll while dragging
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleInteractionEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleInteractionEnd]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  const aspectClass =
    aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio === '3/2'
      ? 'aspect-[3/2]'
      : 'aspect-[16/9]';

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive before and after comparison slider"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full overflow-hidden select-none rounded-xl border border-brand-steelBlue/40 bg-brand-navy shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-cyan ${aspectClass} ${className}`}
    >
      {/* 1. AFTER Image (Base Layer - visible on right side) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={cleanAfter}
          alt={afterAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1000px"
          className="object-cover object-center pointer-events-none"
          priority
        />
        {/* AFTER Label Badge */}
        <div className="absolute bottom-4 right-4 z-10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-white bg-brand-deepNavy/80 backdrop-blur-sm border border-brand-steelBlue/50 rounded-md shadow-md pointer-events-none">
          {afterLabel}
        </div>
      </div>

      {/* 2. BEFORE Image (Clipped Overlay - visible on left side) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full" style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}>
          <Image
            src={cleanBefore}
            alt={beforeAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1000px"
            className="object-cover object-center pointer-events-none"
          />
        </div>
        {/* BEFORE Label Badge */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-white bg-brand-deepNavy/80 backdrop-blur-sm border border-brand-steelBlue/50 rounded-md shadow-md pointer-events-none">
          {beforeLabel}
        </div>
      </div>

      {/* 3. Vertical Divider Line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-brand-cyan shadow-[0_0_12px_rgba(91,192,222,0.8)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      />

      {/* 4. Draggable Handle */}
      <div
        role="slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Comparison slider handle"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-brand-deepNavy border-2 border-brand-cyan text-brand-cyan shadow-[0_0_20px_rgba(91,192,222,0.6)] cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
        style={{ left: `${sliderPosition}%` }}
      >
        <Sliders className="w-5 h-5 pointer-events-none rotate-90" />
      </div>
    </div>
  );
}
