'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Language } from '@/types';
import styles from './CinematicHero.module.css';

interface CinematicHeroProps {
  lang: Language;
  dict: any;
  whatsappUrl?: string;
}

export function CinematicHero({ lang, dict }: CinematicHeroProps) {
  const isRtl = lang === 'ar';

  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Scroll parallax with requestAnimationFrame throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || (typeof window !== 'undefined' && window.innerWidth < 1024)) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Controlled parallax offsets matching DRIVEX cinematic feel
  const bgTextTranslateY = reducedMotion ? 0 : scrollY * 0.14 - mousePos.y * 6;
  const bgTextTranslateX = reducedMotion ? 0 : -mousePos.x * 8;

  const carTranslateY = reducedMotion ? 0 : scrollY * 0.05 + mousePos.y * 4;
  const carTranslateX = reducedMotion ? 0 : mousePos.x * 5;

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={styles.hero}
      aria-label="SpeederSpider Homepage Hero Banner"
    >
      {/* Workshop Telemetry Atelier Bar */}
      <div className={styles['telemetry-bar']}>
        <div className={styles['telemetry-pill']}>
          <span className={styles['telemetry-dot']} />
          <span>{dict.hero?.locationTag || 'DUBAI WORKSHOP ATELIER • AL QUOZ 2'}</span>
        </div>

        <div className={styles['telemetry-brand']}>
          <span className={styles['telemetry-slash']}>//</span>
          <span>SPEEDERSPIDER MOTORSPORT</span>
        </div>
      </div>

      {/* Visual stage containing background typography and vehicle */}
      <div className={styles['hero-stage']}>
        {/* Background typography with parallax */}
        <div
          className={styles['parallax-bg']}
          style={{
            transform: reducedMotion ? 'none' : `translate3d(${bgTextTranslateX}px, ${bgTextTranslateY}px, 0)`,
          }}
        >
          <div className={styles['background-title']} aria-hidden="true">
            {dict.hero?.bgWord || 'NEW ERA'}
            {isRtl && (
              <span className={styles['background-subtitle']}>
                {dict.hero?.bgWordSub || 'عصر جديد في هندسة وحرفية السيارات'}
              </span>
            )}
          </div>
        </div>

        {/* Main vehicle with entrance animation, continuous subtle float, and parallax */}
        <div
          className={styles['parallax-car']}
          style={{
            transform: reducedMotion ? 'none' : `translate3d(${carTranslateX}px, ${carTranslateY}px, 0)`,
          }}
        >
          <div className={styles['car-wrapper']}>
            <div className={styles['car-shadow']} aria-hidden="true" />
            <div className={styles['car-glow']} aria-hidden="true" />
            <img
              src="/images/speederspider-hero-car.webp"
              alt={
                isRtl
                  ? 'سيارة رياضية فائقة الأداء تجسد دقة وحرفية سبيدر سبايدر في دبي'
                  : 'Ultra modern blue sports car showcasing SpeederSpider automotive craftsmanship in Dubai'
              }
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      {/* Bottom content split layout */}
      <div className={styles['hero-bottom']}>
        {/* Left: Description + CTA Buttons */}
        <div className={styles['hero-description']}>
          <p>
            {dict.hero?.description ||
              dict.hero?.editorialDescription ||
              (isRtl
                ? 'صيانة متناهية الدقة، تلميع فائق، وتعديل وتنجيد مخصص للسيارات الفارهة. نهتم بأدق التفاصيل.'
                : 'Precision repairs, premium detailing and automotive customization. Every detail matters.')}
          </p>

          <div className={styles['cta-group']}>
            <Link href={`/${lang}/services`} className={styles['shop-btn']}>
              {dict.hero?.exploreServicesCta || (isRtl ? 'استكشف خدماتنا' : 'EXPLORE OUR SERVICES')}
              <span>{isRtl ? '↖' : '→'}</span>
            </Link>

            <Link href={`/${lang}/our-work`} className={styles['view-work-btn']}>
              {dict.hero?.viewWorkCta || (isRtl ? 'استعراض أعمالنا' : 'VIEW OUR WORK')}
            </Link>
          </div>
        </div>

        {/* Right: Large Uppercase Headline */}
        <h2 className={styles['hero-heading']}>
          {dict.hero?.headingMain || (isRtl ? 'انطلق إلى ما بعد' : 'DRIVE BEYOND')}
          <br />
          <span>{dict.hero?.headingAccent || (isRtl ? 'المألوف.' : 'ORDINARY.')}</span>
          <span className={styles['hero-heading-sub']}>
            {dict.hero?.headingSub || (isRtl ? 'صُممت للهندسة والتميز.' : 'ENGINEERED FOR EXCELLENCE.')}
          </span>
        </h2>
      </div>
    </section>
  );
}
