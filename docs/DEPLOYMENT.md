# SpeederSpider - Deployment, Hosting & Environment Guide

**Project:** SpeederSpider Automotive Digital Platform  
**Document Classification:** Technical DevOps & Deployment Specification

---

## 1. Hosting Architecture & Evaluation

The platform is designed to be fully platform-agnostic while adhering to modern Next.js serverless standards.

### Supported Hosting Options:
1. **Option A: Vercel (Recommended for Next.js App Router)**
   * Native support for Next.js App Router, edge routing, ISR, and dynamic image optimization.
   * Simple custom domain (`speederspider.com`) and automated SSL certificate provisioning.
   * Seamless environment variable configuration.
2. **Option B: Node.js Docker Container (Self-hosted / VPS / AWS ECS / DigitalOcean)**
   * Standalone output mode enabled in `next.config.ts` (`output: 'standalone'`).
   * Portable container image running on Ubuntu/Alpine with Node.js runtime.
3. **Option C: Cloudflare Pages / Workers (Alternative)**
   * Edge execution with low latency across the UAE and GCC region.

---

## 2. Environment Variables Configuration

Create a `.env.local` file for local development. Never commit `.env` or `.env.local` to Git.

### Public Client-Side Variables:
```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Base Domain
NEXT_PUBLIC_SITE_URL=https://speederspider.com
```

### Server-Only Secret Variables (Never Expose to Frontend):
```ini
# Supabase Service Role (For Administrative Server Actions & Migrations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Transactional Email (Resend)
RESEND_API_KEY=re_123456789...
NOTIFICATIONS_FROM_EMAIL=enquiries@speederspider.com
CONTACT_NOTIFICATION_EMAIL=info@speederspider.com

# Anti-Spam / Rate Limiting Secrets
RATE_LIMIT_SECRET=your-random-32-character-secret
```

---

## 3. Build & Production Verification Protocol

Before any production deployment:
1. **Type Check:** `npm run type-check` (Zero TypeScript compilation errors).
2. **Lint Check:** `npm run lint` (No unescaped entities or breaking syntax).
3. **Production Build:** `npm run build` (Ensuring static generation and server bundle creation pass).
4. **Local Smoke Test:** `npm run start` (Verifying `/en`, `/ar`, `/admin/login`, and `/api/health`).
