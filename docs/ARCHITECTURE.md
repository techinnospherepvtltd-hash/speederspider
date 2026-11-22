# SpeederSpider - System Architecture & Technical Blueprint

**Project:** SpeederSpider Automotive Web Platform & Operations Hub  
**Document Classification:** Technical Architecture Document

---

## 1. System Architecture Overview

The SpeederSpider platform is designed as a modern, decoupled, performant, and secure full-stack web application built on **Next.js (App Router)** and **Supabase (PostgreSQL, Auth, RLS, Storage)**.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  +----------------------------+                     +--------------------------+  |
|  |   Public Web (Bilingual)   |                     |     Admin Dashboard      |  |
|  |   /en/* (LTR)              |                     |     /admin/*             |  |
|  |   /ar/* (RTL)              |                     |     (Role-Protected)     |  |
|  +----------------------------+                     +--------------------------+  |
|               |                                                  |                |
+---------------|--------------------------------------------------|----------------+
                |                                                  |
                v                                                  v
+-----------------------------------------------------------------------------------+
|                           NEXT.JS APPLICATION LAYER                               |
|                                                                                   |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|  |   Server Components   |  |   API Routes / Proxy  |  |    Server Actions     |  |
|  |   - ISR / SSR caching |  |   - Contact submission|  |   - Content CRUD      |  |
|  |   - Dynamic Metadata  |  |   - Webhooks / health |  |   - Stock updates     |  |
|  |   - SEO Structured Dt |  |   - Rate Limiting     |  |   - Auth verification |  |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|               |                         |                          |              |
+---------------|-------------------------|--------------------------|--------------+
                |                         |                          |
                v                         v                          v
+-----------------------------------------------------------------------------------+
|                             BACKEND SERVICES LAYER                                |
|                                                                                   |
|  +-------------------------------------+   +-----------------------------------+  |
|  |         Supabase PostgreSQL         |   |         Transactional Email       |  |
|  |  - Auth (Profiles & RBAC)           |   |  - Resend / SMTP API              |  |
|  |  - Row Level Security (RLS)         |   |  - Notification dispatch          |  |
|  |  - Atomic Inventory Transactions    |   |  - Secure server-only env vars    |  |
|  |  - Content Management (EN/AR)       |   +-----------------------------------+  |
|  +-------------------------------------+                                          |
|                                                                                   |
|  +-------------------------------------+   +-----------------------------------+  |
|  |      External Media / Cloud         |   |      Direct Messaging / Maps      |  |
|  |  - Google Drive Media Bridge        |   |  - WhatsApp Direct Chat           |  |
|  |  - Optimized Image Deliveries       |   |  - Dubai Map Coordinates Embed    |  |
|  +-------------------------------------+   +-----------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technology Stack Selection & Rationale

| Layer | Chosen Technology | Architectural Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 15+ (App Router, React 19/18)** | Server-side rendering (SSR) and static generation (SSG/ISR) for search engines; built-in nested bilingual layouts; high performance. |
| **Language** | **TypeScript (Strict Mode)** | Prevents runtime errors, enforces type contracts across database entities, API payloads, and UI props. |
| **Styling & Design System** | **Tailwind CSS** | Design token integration for the SpeederSpider brand palette, responsive utility classes, zero runtime CSS overhead, built-in RTL variants. |
| **Icons** | **Lucide React** | Professional, lightweight SVG icons suited for automotive aesthetics without emoji usage. |
| **Database & Auth** | **Supabase (PostgreSQL + Supabase Auth)** | Fully managed relational database, strict ACID compliance, Row Level Security (RLS) for data protection, and enterprise authentication. |
| **Internationalization** | **Subpath Routing (`/[lang]/...`)** | Clear, crawlable URL separation for English (`/en/`) and Arabic (`/ar/`) with proper canonical, `hreflang`, and direction handling (`ltr`/`rtl`). |
| **Media Handler** | **Custom Drive Media Bridge + Next/Image** | Accommodates Google Drive sharing links while converting to direct streaming URLs and providing responsive, WebP/AVIF optimized delivery with fallbacks. |
| **Transactional Email** | **Resend / Server-side Email Provider** | Direct server-to-server transactional notification for incoming contact enquiries with zero client credential exposure. |

---

## 3. Brand Identity & Design System Tokens

```css
/* Color Palette Specifications */
--color-deep-navy: #0B132B;   /* Primary background & deep contrast */
--color-navy: #1C2541;        /* Secondary background & card surfaces */
--color-steel-blue: #3A506B;   /* Borders, dividers, subtle surfaces */
--color-cyan: #5BC0DE;         /* Primary accent & interactive highlights */
--color-warm-beige: #F4D6B0;   /* Light editorial contrast */
--color-amber: #D97706;        /* Secondary accent, warning & badges */
```

### Typography Scale & Hierarchy
* **Display / Headings (Latin):** Modern technical automotive typography (`Rajdhani`, `Outfit`, or `Inter Tight`).
* **Display / Headings (Arabic):** Clean, modern Arabic typography (`Cairo` or `Tajawal`).
* **Body Text:** Neutral, high-legibility geometric sans (`Inter` / `System-UI`).

---

## 4. Application Folder Structure

```
speederspider/
├── .env.example                     # Environment template without credentials
├── .gitignore                       # Strict Git ignore configuration
├── next.config.ts                   # Next.js configuration & image domains
├── package.json                     # Dependencies & scripts
├── postcss.config.mjs               # PostCSS configuration
├── tailwind.config.ts               # Custom brand design tokens & utilities
├── tsconfig.json                    # Strict TypeScript configuration
├── docs/                            # Mandatory and technical documentation
│   ├── PROJECT_DEVELOPMENT_TRAIL.md # Document A: Chronological technical log
│   ├── FEATURES_AND_USER_GUIDE.md   # Document B: Business & user operations manual
│   ├── ARCHITECTURE.md              # Technical architecture & blueprint
│   ├── DATABASE_SCHEMA.md           # Schema, migrations & RLS documentation
│   ├── SEO_IMPLEMENTATION.md        # Technical & bilingual SEO guide
│   ├── SECURITY.md                  # Security hardening & authorization matrix
│   ├── API_REFERENCE.md             # Endpoints & server action specs
│   └── DEPLOYMENT.md                # Deployment & rollback procedures
├── public/                          # Static assets, logos, robots.txt, sitemaps
│   ├── brand/                       # Logo vectors and brand iconography
│   ├── images/placeholders/         # Automotive placeholders (before/after, services)
│   └── favicon.ico
├── supabase/                        # Database migrations & seed scripts
│   └── migrations/
│       └── 20261122000000_initial_schema.sql
└── src/
    ├── app/
    │   ├── [lang]/                  # Bilingual public web routes (en, ar)
    │   │   ├── layout.tsx           # Bilingual layout (lang, dir, preloader, header, footer)
    │   │   ├── page.tsx             # High-impact homepage
    │   │   ├── about/               # About Us page
    │   │   ├── services/            # Services overview page
    │   │   │   └── [slug]/          # Individual service detail pages
    │   │   ├── our-work/            # Portfolio & before/after showcase
    │   │   │   └── [slug]/          # Project detail page
    │   │   ├── contact/             # Contact page with interactive map & form
    │   │   ├── privacy-policy/      # Privacy policy
    │   │   └── terms/               # Terms of service
    │   ├── admin/                   # Protected administrative dashboard
    │   │   ├── login/               # Admin login portal
    │   │   ├── layout.tsx           # Admin shell with role-aware sidebar
    │   │   ├── page.tsx             # Dashboard metrics & low-stock alerts
    │   │   ├── services/            # Services CRUD management
    │   │   ├── portfolio/           # Portfolio & media CRUD management
    │   │   ├── testimonials/        # Testimonial management
    │   │   ├── inventory/           # Internal stock control & transaction logs
    │   │   ├── enquiries/           # Contact message triage & internal notes
    │   │   └── audit-logs/          # Security & change log (OWNER only)
    │   ├── api/                     # Backend API routes
    │   │   ├── contact/             # Form submission & email trigger
    │   │   └── health/              # System healthcheck endpoint
    │   ├── sitemap.ts               # Dynamic XML sitemap generator
    │   ├── robots.ts                # Dynamic robots.txt
    │   └── not-found.tsx            # Custom automotive 404 page
    ├── components/                  # Modular component library
    │   ├── ui/                      # Reusable atoms (Buttons, Inputs, Cards, Badges)
    │   ├── common/                  # Header, Footer, LanguageSwitcher, WhatsAppButton
    │   ├── automotive/              # Preloader, BeforeAfterSlider, VehicleSpecs
    │   └── admin/                   # Admin data tables, metric cards, modal dialogs
    ├── lib/                         # Core utility libraries
    │   ├── supabase/                # Supabase client (browser, server, admin client)
    │   ├── i18n/                    # Localization dictionaries (en.json, ar.json)
    │   ├── email/                   # Transactional email sender abstraction
    │   ├── media/                   # Google Drive URL parser & validator
    │   └── utils.ts                 # Class merger, formatters, currency helpers
    └── types/                       # TypeScript interfaces and Supabase schema types
        ├── database.ts              # Database schema definitions
        └── index.ts                 # Component and application types
```
