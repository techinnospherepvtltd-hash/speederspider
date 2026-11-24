# SpeederSpider - Project Development Trail

**Project:** SpeederSpider Automotive Business Website, Admin Dashboard & Backend Platform  
**Location:** Dubai, United Arab Emirates  
**Repository:** `https://github.com/techinnospherepvtltd-hash/speederspider.git`  
**Current Branch:** `main`  
**Document Classification:** Mandatory Document A (Chronological Technical Log)

---

## Technical Audit & Development Log

### [Stage 1 & 2] — Repository Audit, Architecture Blueprint & Initial Documentation
* **Timestamp:** 2026-11-22T16:58:00+05:30
* **Status:** Complete
* **Summary:** Initialized empty repository on `main`, configured remote origin, established comprehensive architecture documentation suite (Architecture, Database Schema, SEO, Security, Deployment, Features Manual), created `.env.example` and `.gitignore`, and committed initial migration script.

---

### [Stage 3 & 4] — Design System, Public Bilingual Website & Supabase Backend Layer
* **Timestamp:** 2026-11-22T17:08:00+05:30
* **Status:** Complete
* **Features Implemented:**
  1. **Next.js & Design Tokens:** Setup with TypeScript strict mode, Tailwind CSS configuring exact brand palette:
     * Deep Navy (`#0B132B`)
     * Navy (`#1C2541`)
     * Steel Blue (`#3A506B`)
     * Cyan (`#5BC0DE`)
     * Warm Beige (`#F4D6B0`)
     * Amber (`#D97706`)
  2. **Automotive Preloader (`AutomotivePreloader.tsx`):**
     * Simulated vehicle RPM / telemetry HUD gauge with speed bar.
     * Brand treatment with cyan accent and Arabic/English system status.
     * Automatic timeout fallback ensuring users are never trapped; respects `prefers-reduced-motion`.
  3. **Interactive Before-and-After Slider (`BeforeAfterSlider.tsx`):**
     * 50/50 split with vertical cyan divider and draggable handle.
     * Multi-input support: mouse dragging, touch swipe (with vertical scroll-lock prevention), and keyboard arrows.
     * CLS prevention and responsive aspect ratios.
  4. **Bilingual Subpath Routing (`/[lang]/...`):**
     * Dedicated crawlable URLs for English (`/en/...`) and Arabic (`/ar/...`).
     * Right-to-Left (RTL) layout switching with Arabic typography (`Cairo`/`Tajawal`).
     * Complete centralized translation dictionary (`src/lib/i18n/translations.ts`).
  5. **Core Public Pages:**
     * **Homepage:** Hero with telemetry stats, 7 service cards, interactive Before/After showcase, completed projects, why choose us pillars, authentic reviews, Dubai workshop GPS map, and consultation CTAs.
     * **About Us:** Brand philosophy, Dubai facility photos, engineering values.
     * **Services Overview & 7 Detail Pages:** Dedicated pages for Upholstery, Detailing & Polishing, Window Tinting, Electrical, Mechanical, Multimedia, Denting & Painting with Service JSON-LD schema.
     * **Our Work & Project Details:** Before & After comparisons for Porsche 911 GT3, Mercedes-AMG G63, Nissan Patrol Y62.
     * **Contact Us:** Interactive form with anti-spam honeypot, WhatsApp direct integration (`0565694440`), Dubai GPS map embed (`25.140657502467402, 55.24151547185268`).
     * **Draft Legal Pages:** Privacy Policy and Terms of Service clearly marked for management review.
     * **Custom 404:** Automotive "Track Off Course" page with bilingual return links.
  6. **Supabase Client & Data Layer:**
     * `@supabase/ssr` server and browser client abstractions.
     * Dual data repository (`src/lib/data/db.ts`): queries Supabase when connected, with high-fidelity in-memory runtime fallback ensuring seamless operation.

---

### [Stage 5 & 6] — Multi-Role Admin Dashboard & Integrations
* **Timestamp:** 2026-11-22T17:13:00+05:30
* **Status:** Complete
* **Features Implemented:**
  1. **Admin Portal Shell (`/admin`):**
     * Role-based simulated authentication (`OWNER`, `MANAGER`, `STAFF`).
     * Sidebar navigation reflecting permitted permissions per role.
  2. **Dashboard Overview (`/admin/page.tsx`):**
     * Real-time metrics: Total services, published portfolio projects, customer enquiry count, and low-stock warnings.
     * Critical Low-Stock Alert Banner and preview list.
  3. **Service Management (`/admin/services`):**
     * Full listing of all 7 services.
     * In-line publish/draft toggles.
     * Bilingual editor modal (English & Arabic titles, descriptions, featured images).
  4. **Portfolio Management (`/admin/portfolio`):**
     * Project creation and editing with Before & After URLs.
     * Homepage Featured toggle and publish state control.
  5. **Internal Workshop Inventory (`/admin/inventory`):**
     * Internal stock control (no public catalogue).
     * Filter by category and low-stock threshold alert (`quantity <= min_threshold`).
     * Stock-In (+) modal with supplier notes.
     * Stock-Out (-) modal with vehicle job tracking and insufficient-stock prevention.
     * Manual Adjustment modal with mandatory audit reason logging.
     * Live transaction history audit trail.
  6. **Contact Enquiries Management (`/admin/enquiries`):**
     * Inbox triage with status workflow (`New`, `In Progress`, `Contacted`, `Completed`, `Archived`).
     * Internal notes logger for vehicle VIN, quote amounts, and scheduled dates.
  7. **Audit Logs (`/admin/audit-logs`):**
     * Accessible exclusively to the `OWNER` role; enforces role-restricted security.
  8. **Integrations:**
     * Public Contact API (`POST /api/contact`) with Zod validation, honeypot anti-spam, and rate-limiting.
     * Resend transactional email notification trigger with secure server-only API keys.
     * Google Drive media bridge (`src/lib/media/drive.ts`).
     * Direct WhatsApp click-to-chat with language-specific prefilled messages.

---

### [Stage 7 & 8] — SEO, Security Hardening & Quality Assurance
* **Timestamp:** 2026-11-22T17:15:00+05:30
* **Status:** Complete
* **Features Implemented & Tested:**
  1. **Technical SEO:**
     * Dynamic `sitemap.xml` generated at `/sitemap.ts` covering all static and dynamic English and Arabic routes while excluding `/admin/*` and `/api/*`.
     * Dynamic `robots.txt` generated at `/robots.ts`.
     * Bidirectional `hreflang` alternates with `x-default` and localized canonical URLs.
     * Schema.org JSON-LD structured data: `AutoRepair` / `LocalBusiness`, `Service`, and `BreadcrumbList`.
  2. **Security Hardening:**
     * HTTP Security Headers in `next.config.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, strict `Permissions-Policy`).
     * Row Level Security (RLS) PostgreSQL policies covering all 11 database tables in `supabase/migrations/20261122000000_initial_schema.sql`.
  3. **Quality Verification:**
     * `npm run type-check`: Passed with 0 TypeScript errors.
     * `npm run build`: Production bundle optimized and compiled successfully.

---

### [Stage 9] — Comprehensive Website & Admin Panel Enhancement
* **Timestamp:** 2026-11-22T18:12:00+05:30
* **Status:** Complete
* **Enhancements Implemented & Verified:**
  1. **Before & After Images for All 7 Services:**
     * Implemented dedicated interactive Before/After sliders across all 7 individual service pages (`/[lang]/services/[slug]`).
     * Configured unique, non-generic imagery and bilingual captions for Upholstery, Detailing & Polishing, Window Tinting, Electrical, Mechanical, Multimedia, and Denting & Painting.
     * Admin Service Management modal (`/admin/services`) updated with Before & After image URL inputs, live image previews, bilingual captions, and image clearing controls.
  2. **Automotive Animation Experience:**
     * Added smooth section reveal keyframes (`fadeInUp`, `fadeInDown`, `fadeIn`, `scaleReveal`, `heroSlowPan`).
     * Integrated staggered card entrance delays (`delay-100` through `delay-700`) for the 7 service disciplines on the homepage.
     * Added GPU-accelerated rendering classes (`gpu-render`) and full accessibility compliance with `@media (prefers-reduced-motion: reduce)` disabling all motion smoothly.
  3. **High-Impact Hero Visual Redesign:**
     * Transformed hero from text-heavy to visually striking automotive experience with high-resolution workshop visual, restrained slow-pan background motion, and multi-tone ambient gradients.
     * Staggered text entrances for telemetry badge (with Amber live-pulse indicator), headline, subheadline, CTAs, and performance metrics.
  4. **Official Business Address Integration:**
     * Replaced all previous placeholder/coordinate strings across the application with official address:
       * **English:** `Al Asayel St - Al Qouz Ind. Second - Al Quoz - Dubai`
       * **Arabic:** `شارع الأصايل - القوز الصناعية الثانية - القوز - دبي`
     * Updated Footer, Contact page, About facility banner, WorkshopMap component, and Schema.org `AutoRepair` structured data.
  5. **Portfolio Project Descriptions & SEO Metadata:**
     * Added `short_desc_en`, `short_desc_ar`, `desc_en`, `desc_ar`, `seo_title_en`, `seo_title_ar`, `seo_desc_en`, `seo_desc_ar` to database types and SQL migration (`supabase/migrations/20261122010000_enhancements.sql`).
     * Admin Portfolio Management modal (`/admin/portfolio`) updated with live Before/After thumbnail previews, short card summaries, full scope descriptions, vehicle metadata, and SEO fields.
     * Portfolio showcase grid (`/[lang]/our-work`) renders short descriptions, and individual detail pages (`/[lang]/our-work/[slug]`) render full descriptions and dynamic SEO tags.
  6. **"Rate Us on Google" CTA Button:**
     * Created `GoogleReviewButton.tsx` with official vector icon, 5-star rating graphic, and bilingual labels (`Rate Us on Google` / `قيّمنا على Google`).
     * Configurable via new `AdminSettingsCard.tsx` on the admin overview (`/admin`) and stored in `site_settings` table.
     * Retains disabled/hidden state when URL is unconfigured to prevent broken links or fake review claims.
  7. **Manual Workshop Inventory Entry & Full API:**
     * **Root Cause Fixed:** Removed `INITIAL_INVENTORY` mock objects and auto-generated fake SKU logic.
     * Built complete RESTful inventory API (`/api/inventory` and `/api/inventory/transaction`) with Zod validation.
     * Admin Inventory page (`/admin/inventory`) now supports:
       * "Add Inventory Item" modal with complete manual fields (Name EN/AR, SKU with generator, Category, Quantity, Min Threshold, Cost Price, Supplier, Storage Bay, Status).
       * "Edit Item" modal for updating existing stock records.
       * Permanent deletion with confirmation modal.
       * Stock-In, Stock-Out (with negative balance protection), and Audit Adjustment with mandatory reason logging.
  8. **Amber Palette Integration:**
     * Restrained integration of Amber (`#D97706`) on star ratings, warning alerts, live status indicators, button accents, and active badges alongside Deep Navy, Navy, Steel Blue, Cyan, and Warm Beige.
  9. **Production Verification:**
     * `npm run type-check`: 0 errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully.

---

### [Stage 10] — Cinematic Automotive Hero Section Redesign
* **Timestamp:** 2026-11-22T19:38:00+05:30
* **Status:** Complete
* **Visual Reference Implementation Details:**
  1. **Cinematic Hero Architecture (`CinematicHero.tsx`):**
     * Built dedicated client component replacing the conventional text/image hero with a high-end automotive campaign poster layout.
     * **Atmosphere:** Deep navy/black palette (`#070C1E` to `#0B132B`) with an overhead radial spotlight beam, fine technical floor grid, and subtle amber horizon accent glow.
     * **Background Typography:** Displayed oversized `PERFORMANCE` wordmark (`text-[15.5vw]`) in bold condensed metallic typography positioned directly behind the vehicle. In Arabic, accompanied by stylized submark `أداء فائق الدقة`.
     * **Central Vehicle:** Integrated client-supplied high-resolution electric cyan supercar cutout (`/images/hero-supercar.png`), perfectly matching SpeederSpider's signature cyan accent palette (`#5BC0DE`). Anchored with multi-layered radial contact shadows and subtle cyan under-chassis floor reflection, allowing the oversized background typography `PERFORMANCE` to be partially revealed behind the curves and roofline.
  2. **Editorial Split Bottom Layout:**
     * **Left / Start Column:**
       * Location badge: `DUBAI WORKSHOP ATELIER • AL QUOZ 2` with pulsing Amber live status indicator.
       * Short brand statement: *"Precision repairs. Premium detailing. Automotive craftsmanship without compromise."* (Arabic: *"صيانة متناهية الدقة. تلميع احترافي متكامل. حرفية سيارات استثنائية بلا مساومة في دبي."*).
       * Primary CTA: `EXPLORE OUR SERVICES` / `استكشف خدماتنا` with Cyan glow, hover scale, and Amber accent underline.
       * Secondary CTA: Direct WhatsApp consultation link with Amber vector icon.
     * **Right / End Column:**
       * Massive architectural headline: `DRIVE BEYOND ORDINARY.` (Arabic: `انطلق إلى ما بعد المألوف.`) with multi-tone gradient accent.
       * Motorsport attribution: `SPEEDERSPIDER // CRAFTED FOR PERFECTION`.
  3. **Multi-Stage Cinematic Animation:**
     * **Initial Load:** Sequenced reveals (background typography -> car reveal with scale/translation drift -> headline lines -> description -> CTAs).
     * **Interactive Mouse Tilt:** Subtle 3D perspective separation between the background typography and foreground vehicle on desktop pointer movement.
     * **Scroll Parallax:** Native 60fps parallax translating background typography (`scrollY * 0.22`) and vehicle (`scrollY * 0.08`) at different speeds with smooth fade-out.
     * **Accessibility:** Automatic detection of `prefers-reduced-motion` disabling all parallax, tilts, and transitions for an immediate clean static view.
  4. **Workshop Metric Strip:**
     * Preserved the 3 core telemetry stats (`7 Services`, `Al Quoz Industrial 2`, `Bespoke Team`) in a technical strip below the hero.
  5. **Verification & Quality:**
     * `npm run type-check`: 0 errors.
     * `npm run build`: Production build completed with 33 routes optimized.
     * Tested both `http://localhost:3000/en` and `http://localhost:3000/ar` with HTTP 200 OK and verified presence of all new editorial elements and RTL support.

---

### [Stage 11] — Direct Reference Alignment with SpeederSpider Blue Palette
* **Timestamp:** 2026-11-22T19:55:00+05:30
* **Status:** Complete
* **Reference Implementation Details:**
  1. **"NEW ERA" Brushed-Steel Typography:**
     * Replicated the oversized **`NEW ERA`** block lettering from the reference image, rendered in authentic vertical brushed-steel gradient with drop shadows.
     * Balanced 3-letter symmetry ("NEW" on left, "ERA" on right) framing the central car.
  2. **SpeederSpider Blue Palette Floor & Horizon Ambiance:**
     * Translated the reference's warm floor into SpeederSpider's brand palette: Deep Navy (`#0B132B`) studio floor with fine horizontal perspective grain, ambient Cyan (`#5BC0DE`) horizon glow, and deep dark ceiling void.
  3. **Supercar Grounding:**
     * Positioned the user-supplied electric cyan supercar overlapping the lower half of the `NEW ERA` typography with multi-stage radial floor contact shadows and subtle cyan chassis underglow.
  4. **Reference Bottom Split Layout:**
     * **Bottom Left:** Short brand description alongside a high-contrast white pill CTA button (`[ Explore Services → ]`).
     * **Bottom Right:** Bold, all-caps condensed 2-line headline: `FIND THE PERFECT FIT` / `THAT ELEVATES YOUR JOURNEY` (Arabic: `انطلق إلى ما بعد المألوف` / `حرفية استثنائية ترتقي برحلتك`).
  5. **Verification:**
     * `npm run type-check`: 0 errors.
     * `npm run build`: Production build completed with 33 routes optimized.
     * Verified HTTP 200 responses on both English (`/en`) and Arabic (`/ar`).

---

### [Stage 12] — Global Typography Overhaul: Russo One & Recursive Medium
* **Timestamp:** 2026-11-22T19:58:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Russo One Display Font:**
     * Configured **Russo One** as the global display font across all headings (`h1` through `h6`), hero banners (`NEW ERA`), service titles, portfolio project titles, navigation brand logos, and `.font-display` elements.
     * Brings bold, condensed motorsport-inspired impact with tight letter spacing (`-0.01em`).
  2. **Recursive Medium Body Font:**
     * Configured **Recursive** (weight `500` - Medium) as the global body and UI typeface (`font-sans`), giving body paragraphs, technical specs, numbers, telemetry labels, buttons, and admin portals an ultra-refined, modern automotive atelier finish.
  3. **Multi-Channel Font Delivery:**
     * **HTML `<head>` Injection (`layout.tsx`):** Preconnect to Google Fonts with stylesheet link.
     * **CSS `@import` (`globals.css`):** Direct stylesheet import ensuring instantaneous font availability.
     * **Tailwind Token Mapping (`tailwind.config.ts`):** Mapped `fontFamily.sans` to `'Recursive'` and `fontFamily.display` to `'Russo One'`.
  4. **Direction-Aware Localization:**
     * Maintained fallback and primary Arabic typography (`Cairo`/`Tajawal`) for right-to-left localized pages while keeping Latin wordmarks and codes rendered in Russo One and Recursive.
  5. **Verification:**
     * `npm run type-check`: 0 errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully.

---

### [Stage 13] — Full-Width Cinematic Hero Banner: Above-The-Fold Viewport Guarantee & Grounded Physics
* **Timestamp:** 2026-11-22T20:07:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Above-The-Fold Viewport Guarantee (`calc(100dvh - 5rem)`):**
     * Solved vertical viewport overrun by constraining the hero banner to `h-[calc(100dvh-5rem)] min-h-[580px] max-h-[920px] overflow-hidden` on desktop/tablet, factoring in the 80px fixed navigation header.
     * Guaranteed zero content clipping or vertical scroll requirements to view all hero elements (oversized typography, grounded supercar, telemetry badge, supporting description, white pill CTA button, and promotional headline).
  2. **Grounded Product Physics & Multi-Tier Contact Shadows:**
     * Implemented multi-point physics grounding under the electric cyan supercar:
       * **Layer 1:** Broad radial chassis ambient drop shadow (`radial-gradient` black/95 to transparent).
       * **Layer 2:** Tight front-left wheel contact shadow (`blur-[2px]` high-density black ellipse).
       * **Layer 3:** Front splitter and front-right tire contact shadow.
       * **Layer 4:** Rear wheel contact shadow.
       * **Layer 5:** Electric cyan paint floor reflection glow (`rgba(91,192,222,0.28)`).
       * **Layer 6:** Inverted, vertically flipped studio floor mirror reflection with linear-gradient alpha mask.
  3. **Brushed-Steel Background Typography (`PERFORMANCE`):**
     * Oversized bold headline in **Russo One** positioned directly behind the vehicle, naturally overlapped by the car body while remaining crisp and readable on both flanks.
     * Rendered with an authentic 6-stop vertical brushed-metal gradient with 3D drop-shadows.
  4. **Editorial Bottom Split Layout (Reference Concept):**
     * **Bottom Left:** Supporting editorial copy alongside a high-contrast white rounded pill button (`[ Explore Services → ]`) with hover cyan transition and micro-interactions.
     * **Bottom Right:** Bold two-line attention-grabbing promotional headline in **Russo One** (`DRIVE BEYOND ORDINARY` / `CRAFTED FOR PERFECTION` in EN, and `انطلق إلى ما بعد المألوف` / `صياغة الأداء الفائق في دبي` in AR).
  5. **Studio Environment & Floor Texture:**
     * Dark void ceiling fading into a cyan horizon bloom with horizontal studio floor grain matching high-end automotive campaign art direction.
  6. **Verification & Testing:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 33/33 static and dynamic pages compiled with 0 errors.

---

### [Stage 14] — SpeederSpider Hero Banner: Direct DRIVEX Reference Code Port & Scoped Architecture
* **Timestamp:** 2026-11-22T20:32:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Direct Port of DRIVEX Layout & Positioning Architecture:**
     * Implemented scoped CSS module (`CinematicHero.module.css`) matching the DRIVEX reference code structure.
     * **Background Typography (`.background-title`):** Positioned at `top: 17%`, `left: 50%`, `font-size: clamp(130px, 23vw, 340px)`, letter-spacing `-8px`, with warm cream fill (`rgba(244, 214, 176, 0.12)`) and cyan outline (`-webkit-text-stroke: 1px rgba(91, 192, 222, 0.35)`).
     * **Vehicle Wrapper (`.car-wrapper`):** Positioned at `top: 21%`, `left: 50%`, `width: min(92%, 1150px)` with dual drop-shadows and entrance/continuous float animations.
     * **Bottom Split Layout (`.hero-bottom`):** Positioned at `bottom: 45px`, `left: 5%`, `right: 5%`, with description and CTAs on the left/start, and uppercase heading on the right/end.
  2. **Replacement of DRIVEX Branding with SpeederSpider:**
     * Maintained SpeederSpider identity, existing navbar header, and workshop atelier status pill (`DUBAI WORKSHOP ATELIER • AL QUOZ 2`).
     * Heading: `DRIVE BEYOND ORDINARY.` (Arabic: `انطلق إلى ما بعد المألوف.`).
     * Subheadline: `ENGINEERED FOR EXCELLENCE.` (Arabic: `صُممت للهندسة والتميز.`).
     * Supporting Copy: `"Precision repairs, premium detailing and automotive customization. Every detail matters."`.
     * Primary CTA: `EXPLORE OUR SERVICES` linking to `/${lang}/services` with hover amber transition (`#D97706`) and arrow micro-interaction.
     * Secondary CTA: `VIEW OUR WORK` linking to `/${lang}/our-work`.
  3. **Atmospheric Environment & Background:**
     * Applied DRIVEX background radial gradient (`ellipse at 50% 70%, rgba(91, 192, 222, 0.20), transparent 48%`) over linear gradient (`#0B132B` 0%, `#1C2541` 65%, `#0B132B` 100%).
     * Generated pseudo-element `.hero::before` with repeating cyan scanlines at 0.08 opacity.
     * Generated `.hero::after` with high-blur cyan ambient bloom (`width: 850px; height: 350px; filter: blur(130px)`).
  4. **Vehicle Asset Integration:**
     * Configured high-resolution transparent ultra-modern blue sports car WebP (`/images/speederspider-hero-car.webp`).
     * Grounded with physics-based contact shadow (`radial-gradient` ellipse at center) and dual drop-shadows.
  5. **Entrance & Float Animations:**
     * `titleReveal`: 1.2s ease-out translate from 35px to 0.
     * `carReveal`: 1.3s ease-out upward translate from 55px + scale from 0.95 to 1.
     * `carFloat`: Continuous 6s ease-in-out breathing floating effect (8px amplitude).
     * `contentReveal`: Staggered description (0.7s) and heading (1.0s) reveal animations.
     * Decoupled scroll & mouse parallax containers (`.parallax-bg` and `.parallax-car`) from CSS animations.
  6. **Comprehensive Breakpoints & RTL Localization:**
     * Desktop (>1024px), Tablet (<=1024px), Mobile (<=768px), Small Mobile (<=420px), and Short Landscape screens (`max-height: 600px and min-width: 769px`).
     * Full Arabic (`[dir="rtl"]`) typography and layout alignment with flipped arrow glyphs.
     * Full accessibility compliance via `@media (prefers-reduced-motion: reduce)`.
  7. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully in 3.1s.

---

### [Stage 15] — Vehicle Elevation & 25% Background Typography Overlap
* **Timestamp:** 2026-11-22T20:38:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Pixel-Accurate Asset Trimming:**
     * Identified that the raw vehicle PNG contained 247px of transparent dead space above the car roof.
     * Applied `sharp` trimming to crop transparent margins (`813x323px`), reducing asset size from 269KB to 54KB (80% compression savings) and ensuring the top edge of the image matches the exact roofline of the sports car.
  2. **Calibrated Vertical Overlap:**
     * Adjusted `.background-title` to `top: 14%` on desktop with `clamp(130px, 22vw, 320px)`.
     * Elevated `.car-wrapper` to `top: 24%` on desktop with `z-index: 2` (positioned directly above `z-index: 1` background text).
     * Guaranteed that the roofline and upper cabin cover exactly the bottom ~25% of the `NEW ERA` typography while leaving the top 75% bold, clear, and visible behind the car.
  3. **Responsive Breakpoints:**
     * Tablet: `.background-title` at `top: 15%`, `.car-wrapper` at `top: 22%`.
     * Mobile: `.background-title` at `top: 17%`, `.car-wrapper` at `top: 23%`.
     * Small Mobile: `.background-title` at `top: 18%`, `.car-wrapper` at `top: 24%`.
     * Short Landscape: `.background-title` at `top: 10%`, `.car-wrapper` at `top: 16%`.
  4. **Grounding Contact Shadow & Floor Glow:**
     * Re-anchored `.car-shadow` (`bottom: -6px`) and `.car-glow` (`bottom: -2px`) directly beneath the trimmed tire contact patches.
  5. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully.

---

### [Stage 16] — Vehicle Boundary Containment & Mobile CTA Visibility Optimization
* **Timestamp:** 2026-11-22T20:46:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Vehicle Sizing Refinement:**
     * Scaled down `.car-wrapper` on desktop to `width: min(80%, 960px)` (from 1150px), creating generous vertical clearance and refined proportions.
     * Tablet width reduced to `min(85%, 720px)`.
  2. **Mobile Viewport Boundary Containment (Zero Edge Crossing):**
     * Eliminated overflow rules (`110%` and `120%` widths) that caused the vehicle to cross screen boundaries on mobile.
     * Mobile (<=768px): Constrained to `width: min(86%, 400px)` with `top: 21%`.
     * Small Mobile (<=420px): Constrained to `width: min(88%, 330px)` with `top: 20%`.
     * The vehicle remains centered with guaranteed lateral margins, never clipping or crossing the mobile viewport.
  3. **Complete CTA & Text Visibility Above-The-Fold:**
     * Replaced `min-height: 100svh` on mobile with `min-height: calc(100dvh - 4.5rem)` to account for the sticky header height, preventing bottom content from being pushed below the fold.
     * Reorganized `.hero-bottom` stack order on mobile to `flex-direction: column-reverse; gap: 14px;`, placing the headline (`DRIVE BEYOND ORDINARY.`) right beneath the car, followed by the supporting description and action CTAs.
     * Calibrated mobile text and button sizing (`.shop-btn` padding: 12px 18px; font-size: 12px; `.view-work-btn` padding: 11px 14px), guaranteeing that both CTAs are 100% visible, accessible, and never hidden by screen boundaries or overlapping elements.
  4. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully in 2.4s.

---

### [Stage 17] — Mobile Vertical Gap Elimination & Visual Rhythm Optimization
* **Timestamp:** 2026-11-22T20:52:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Root Cause Analysis (Client Screenshot `media_1795360771545_2b8f5d02.jpg`):**
     * Identified that `.car-wrapper` at `top: 21%` sat too high near the workshop status pill, while `.hero-bottom` sat pinned to `bottom: 25px`.
     * On tall mobile viewports, this created a ~340px empty vertical chasm between the vehicle tires and the bottom content.
  2. **Harmonious Vertical Distribution:**
     * Shifted `.car-wrapper` down from `top: 21%` to `top: 29%` (and small mobile `top: 27%`), positioning the sports car in the upper-middle focal zone.
     * Shifted `.background-title` from `top: 15%` to `top: 20%` (font-size: `clamp(85px, 23vw, 120px)`), maintaining the 25% overlap behind the car roof.
     * Elevated `.hero-bottom` to `bottom: clamp(28px, 6vh, 50px)`, reducing the vertical void by more than 180px into a tight, balanced automotive gap (~120-140px).
  3. **Atmospheric Fill & Subheadline Separation:**
     * Re-centered the mobile radial cyan glow (`ellipse at 50% 48%`) to illuminate the middle horizon directly behind the car body.
     * Applied `display: block; margin-top: 6px;` to `.hero-heading-sub`, preventing `ENGINEERED FOR EXCELLENCE.` from running inline next to `ORDINARY.`.
  4. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully in 2.1s.

---

### [Stage 18] — Mobile Gap Tightening: Direct Car-to-CTA Proximity Optimization
* **Timestamp:** 2026-11-22T20:58:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Direct Car-to-CTA Distance Calibration:**
     * Further lowered `.car-wrapper` on mobile from `top: 29%` to `top: 38%` (and small mobile `top: 35%`), bringing the sports car directly down into close visual proximity with the bottom content.
     * Adjusted `.background-title` to `top: 27%` (and small mobile `top: 25%`) to preserve the 25% overlap of the `NEW ERA` typography behind the vehicle roof.
     * Elevated `.hero-bottom` to `bottom: clamp(32px, 7vh, 55px)` with tightened `gap: 12px`.
  2. **Visual Gap Reduction:**
     * Reduced the physical visual distance between the car's ground contact shadow and the headline/CTA block to a tight, focused ~45-55px.
     * Completely eliminated the empty blue gap on mobile devices while keeping all elements 100% visible and thumb-accessible above the fold.
  3. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully in 2.4s.

---

### [Stage 19] — Background Typography Elevation & 50% Text Visibility Calibration
* **Timestamp:** 2026-11-22T21:07:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Background Typography Elevation:**
     * Pulled `.background-title` a bit higher:
       * Desktop (>1024px): `top: 10.5%` with `clamp(130px, 21vw, 300px)`
       * Tablet (<=1024px): `top: 11%` with `clamp(90px, 15vw, 170px)`
       * Mobile (<=768px): `top: 21%` with `clamp(80px, 22vw, 110px)`
       * Small Mobile (<=420px): `top: 20%` with `21vw`
  2. **Refined Vehicle Scale Reduction:**
     * Reduced car wrapper width across all viewports to provide elegant proportions, generous text visibility, and ample CTA clearance:
       * Desktop: `width: min(73%, 860px)` at `top: 21%`
       * Tablet: `width: min(76%, 660px)` at `top: 20%`
       * Mobile: `width: min(84%, 370px)` at `top: 29%`
       * Small Mobile: `width: min(84%, 320px)` at `top: 28%`
  3. **50% Text Exposure Result:**
     * The vehicle roofline cuts directly across the mid-height of the `NEW ERA` typography.
     * Exactly half (~50%) of the uppercase block letters stand proud and completely visible above the car, with the lower half smoothly overlapped behind the roof and spoiler.
  4. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 33/33 static and dynamic routes compiled successfully in 2.5s.

---

### [Stage 20] — Official SpeederSpider Logo & Brand Crest Integration
* **Timestamp:** 2026-11-22T21:18:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Official Asset Ingestion & Generation:**
     * Ingested user-provided official brand crest emblem (`speederspider-logo.jpg`), featuring a metallic chrome shield with mechanical spider crest, electric cyan supercar with glowing headlights, metallic `SPEEDER`, cyan `SPIDER®`, and `DRIVE BEYOND ORDINARY` tagline on deep navy background (`#0B132B`).
     * Generated high-performance WebP and PNG assets via `sharp`:
       - `public/images/speederspider-logo.webp` & `public/images/speederspider-logo.png`: Full master logo (1024x682).
       - `public/images/speederspider-shield-full.webp`: Full shield crest with wordmark and tagline (884x635) with transparent background and subtle cyan glow.
       - `public/images/speederspider-crest-car.webp`: Isolated shield crest with mechanical spider and supercar silhouette (824x470) for compact headers, preloader, and badges.
       - `src/app/icon.png` (192x192) & `src/app/apple-icon.png` (180x180): High-resolution browser and mobile home-screen icons with brand navy backing.
       - `public/favicon.ico` & `public/favicon.png` (32x32): Clean, crisp browser tab favicon.
  2. **Sitewide Brand Integration Across All Key Touchpoints:**
     * **Primary Header (`src/components/common/Header.tsx`):** Replaced placeholder wrench icon with the authentic `speederspider-crest-car.webp` emblem in a luxury 44x44 container featuring hover scale and cyan glow.
     * **Site Footer (`src/components/common/Footer.tsx`):** Prominently showcases the full official `speederspider-shield-full.webp` logo crest with `SPEEDER SPIDER` and `DRIVE BEYOND ORDINARY` tagline above workshop description.
     * **Admin Portal Layout (`src/app/admin/layout.tsx`):** Replaced wrench placeholder with the official brand crest across both mobile top bar and desktop sidebar header.
     * **Admin Login (`src/app/admin/login/page.tsx`):** Elevated login card with the official full shield emblem featuring luxury cyan drop shadow.
     * **404 Route (`src/app/not-found.tsx`):** Replaced generic wrench with the official brand crest inside a glowing 80x80 badge.
     * **Automotive Preloader (`src/components/automotive/AutomotivePreloader.tsx`):** Features the official brand crest above the telemetry speed gauge during initial page load.
     * **About Atelier (`src/app/[lang]/about/page.tsx`):** Anchored editorial header with the official brand crest emblem.
     * **Metadata & Social Graph (`src/app/layout.tsx` & `src/app/[lang]/layout.tsx`):** Configured favicon, app icons, and OpenGraph/Twitter summary card images pointing to `/images/speederspider-logo.jpg`.
  3. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 35/35 routes compiled cleanly with automatic static icon generation.

---

### [Stage 21] — Mobile Hero Compact Proportions & Next-Section Visibility
* **Timestamp:** 2026-11-22T22:20:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Architectural Decoupling with Dedicated `.hero-stage`:**
     * Introduced a dedicated `.hero-stage` wrapper inside `CinematicHero.tsx` containing `.parallax-bg` and `.parallax-car`.
     * On desktop (>768px), `.hero-stage` retains `position: absolute; inset: 0; pointer-events: none;` ensuring zero regression to the cinematic full-screen desktop experience.
     * On mobile (<=768px), `.hero-stage` operates as a controlled relative frame (`position: relative; height: clamp(200px, 28vh, 235px);`), locking `NEW ERA` and the car into a proportional visual unit.
  2. **Elimination of Mobile Viewport Lock (No More Full-Screen Void):**
     * Removed `min-height: calc(100dvh - 4.5rem);` from `.hero` on mobile, replacing it with `min-height: auto; height: auto; padding-bottom: 28px; display: flex; flex-direction: column;`.
     * Converted `.hero-bottom` on mobile from `position: absolute; bottom: ...;` to `position: relative; margin-top: 10px; padding: 0 5%;`.
     * The CTA group and headline now sit directly underneath the car's ground contact shadow with a tight, natural ~14–18px gap, completely eliminating the previous empty navy void.
  3. **Above-the-Fold Next Section Exposure:**
     * The total mobile hero banner height is now ~455px (including header, telemetry, car stage, headline, and CTAs).
     * On standard mobile screens (e.g., iPhone 14/15/16 at 844–932px height), the remaining ~300–380px of the viewport immediately showcases the workshop metric telemetry cards and services section below the hero.
  4. **Verification:**
     * `npm run type-check`: 0 TypeScript errors.
     * `npm run build`: 35/35 routes compiled successfully in 2.9s.


---

### [Stage 22] — Simple Business Money & Payment Tracker Module
* **Timestamp:** 2026-11-25T00:50:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Schema & Migration (`public.payments`):**
     * Authored migration `supabase/migrations/20261125000000_payments_schema.sql` creating table `public.payments` with `id` (UUID), `transaction_date` (date), `transaction_type` (INCOME, EXPENSE, OWNER_WITHDRAWAL, OWNER_CONTRIBUTION), `amount` (numeric(12,2) in AED), `category`, `description`, `payment_method` (CASH, BANK_TRANSFER, CARD, OTHER), `reference_number`, `created_by`, `created_at`, and `updated_at`.
     * Added performance indexes on `transaction_date`, `transaction_type`, `category`, and `created_at`.
     * Enabled Row Level Security (RLS) with policies restricting financial visibility and mutations to authorized `owner` and `manager` roles (`is_manager_or_above()`, `is_owner()`).
     * Appended complete schema into `supabase/COMPLETE_SETUP.sql`.
  2. **Data Layer & Calculations (`src/lib/data/db.ts`):**
     * Registered TypeScript interfaces and types: `PaymentTransactionType`, `PaymentMethod`, `PaymentItem`, `PaymentSummary`, `PaymentFilters`, `PaymentCategoryBreakdown`, `MonthlyCashFlow`.
     * Initialized clean, empty in-memory runtime array `let memoryPayments: PaymentItem[] = []` ensuring zero mock/dummy transactions.
     * Implemented core repository functions:
       - `getPayments(filters)`: Supports type, category, date presets (`today`, `this_week`, `this_month`, `last_month`, `custom`, `all`), and search queries.
       - `createPayment(...)`, `updatePayment(...)`, `deletePayment(...)`.
       - `getPaymentSummary(filters)`: Computes actual mathematical totals:
         * `Total Income`, `Total Expenses`, `Total Owner Withdrawals`, `Total Owner Contributions`.
         * `Net Operating Cash Flow = Total Income - Total Expenses`.
         * `Net Cash Movement = Total Income + Total Owner Contributions - Total Expenses - Total Owner Withdrawals`.
         * Spending by category with percentage distribution and amounts.
         * Income by category and monthly cash flow progression.
  3. **Protected API Endpoint (`src/app/api/payments/route.ts`):**
     * Enforced server-side session authentication with `verifyAdminRouteAccess(req, ['owner', 'manager'])`.
     * Strict Zod payload validation for amounts, dates, and categories.
     * Integrated automated audit logging (`PAYMENT_CREATE`, `PAYMENT_UPDATE`, `PAYMENT_DELETE`) in `public.audit_logs`.
     * Revalidation triggers for `/admin/payments` and `/admin`.
  4. **Admin UI (`src/app/admin/(portal)/payments/page.tsx`):**
     * 6 KPI summary cards displaying exact financial metrics with directional badges and AED currency formatting.
     * Dynamic date preset filters (Today, This Week, This Month, Last Month, Custom Range, All Time).
     * Spending & Income category breakdowns with interactive visual percentage bars.
     * Full transaction history table with color-coded badges (Green income, Red expense, Amber withdrawal, Cyan contribution).
     * Add/Edit transaction modal featuring dynamic categories tailored to selected transaction type + custom "Other" text entry.
     * One-click client-side CSV export generator (`speeder-spider-transactions-[date].csv`).
     * Delete confirmation safety modal.
  5. **Navigation & Dashboard Integration:**
     * Added `Money Tracker` navigation entry with `Wallet` icon into `AdminPortalShell.tsx` for `owner` and `manager` roles.
     * Added live Cash Flow summary card in main workshop admin telemetry dashboard (`src/app/admin/(portal)/page.tsx`).


---

### [Stage 23] — Pagani Huayra Hero Banner & Expandable Floating Social Contact Menu
* **Timestamp:** 2026-11-25T01:22:00+05:30
* **Status:** Complete
* **Implementation Details:**
  1. **Pagani Huayra Hypercar Hero Image Ingestion:**
     * Ingested user-provided silver Pagani Huayra cutout (`media_1795549716740_066332c1.png`).
     * Trimmed transparent whitespace and generated high-performance WebP (`public/images/speederspider-hero-car.webp`, 1014x449, 189 KB) with 95% quality and effort 6, alongside lossless PNG fallback.
     * Backed up previous hero car asset to `public/images/speederspider-hero-car-backup.webp`.
     * Preserved cinematic DRIVEX multi-plane scroll/mouse parallax, floor contact shadow, and cyan underglow.
  2. **Expandable Multi-Channel Floating Action Menu (`src/components/common/WhatsAppButton.tsx`):**
     * Converted the static single-channel WhatsApp floating button into an interactive luxury Speed-Dial contact widget.
     * **Floating Trigger Button:** Features official tri-channel indicator badges (WhatsApp green, Instagram gradient, Facebook blue) and "Connect" pill with ambient gradient glow. Transforms into an `X` with rotate transition when opened.
     * **Expandable Speed-Dial Popup:** Pops up directly above the trigger button with glassmorphism backing (`bg-brand-deepNavy/95 border border-brand-cyan/40 backdrop-blur-xl`):
       1. **WhatsApp Direct:** (+971 56 569 4440) with prefilled bilingual booking inquiry.
       2. **Instagram:** Direct link to `https://www.instagram.com/speederspiderae/` (@speederspiderae).
       3. **Facebook:** Direct link to `https://www.facebook.com/profile.php?id=61596871021810`.
     * **Interaction Dismissal:** Automatically closes on clicks outside, touch outside, Escape key press, or page scroll.
     * Full bidirectional support: Anchored at bottom-right for English (LTR) and bottom-left for Arabic (RTL).
  3. **Sitewide Social Links Synchronization:**
     * Updated official Instagram URL to `https://www.instagram.com/speederspiderae/` and Facebook URL to `https://www.facebook.com/profile.php?id=61596871021810` in `Footer.tsx` and Organization JSON-LD schema in `src/app/[lang]/page.tsx`.
