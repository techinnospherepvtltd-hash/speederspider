
# SpeederSpider - Features & Operations User Guide

**Document Classification:** Mandatory Document B (Business Owner & Operations Manual)  
**Target Audience:** SpeederSpider Management, Workshop Managers, Inventory Clerks, and Technicians.  
**System Version:** v1.0.0-production-ready

---

## 1. Overview of the Platform
SpeederSpider is a premier automotive repair, maintenance, detailing, and customization digital platform based in Dubai, UAE.
* **Official Workshop Address:** `Al Asayel St - Al Qouz Ind. Second - Al Quoz - Dubai`
* **Arabic Address:** `شارع الأصايل - القوز الصناعية الثانية - القوز - دبي`
* **GPS Coordinates:** `25.140657502467402, 55.24151547185268`

The platform consists of two integrated operational environments:
1. **Public-Facing Bilingual Web Atelier:** Delivering a luxury automotive brand presence in English and Arabic for clients seeking high-end automotive craftsmanship across Dubai and neighboring Emirates.
2. **Internal Multi-Role Workshop Portal (`/admin`):** Providing secure operational control over content, customer enquiries, and internal workshop inventory with atomic stock tracking.

---

## 2. Public Website Architecture & Features

### 2.1 Bilingual Subpath Routing & Right-to-Left (RTL) Layouts
* The platform features dedicated crawlable routes for both English (`/en/...`) and Arabic (`/ar/...`).
* Switching to Arabic activates native Right-to-Left (RTL) layout rendering, cultural direction alignment, and Arabic typography (`Cairo`/`Tajawal`).
* Search engines receive exact bidirectional `hreflang` alternate references and localized canonical URLs.

### 2.2 Automotive Preloader with Telemetry HUD
* High-impact automotive preloader featuring an accelerating RPM / speed gauge and telemetry status check.
* Automatically dismisses cleanly upon readiness (maximum 1.4-second safety timeout ensures users are never trapped).
* Automatically deactivated when `prefers-reduced-motion` is detected.

### 2.2B Cinematic Automotive Hero Banner (DRIVEX Architecture)
* **Full-Screen Atmospheric Composition:** Powered by a scoped CSS module architecture (`CinematicHero.module.css`), featuring a radial cyan horizon bloom over deep navy gradients (`#0B132B` to `#1C2541`), subtle repeating scanlines, and high-blur bottom glow.
* **Positioning Hierarchy:**
  * Background Typography: `.background-title` at `top: 10.5%` (desktop) and `top: 10px` within `.hero-stage` (mobile), rendered in **Russo One** with warm cream fill (`rgba(244, 214, 176, 0.12)`) and cyan outline stroke (`-webkit-text-stroke: 1px rgba(91, 192, 222, 0.35)`).
  * Vehicle Wrapper: `.car-wrapper` elevated to `top: 21%` on desktop and `top: 48px` within `.hero-stage` on mobile with width `min(84%, 350px)`, allowing exactly 50% of `NEW ERA` to remain visible above the roofline.
  * Desktop Bottom Split Layout: `.hero-bottom` at `bottom: 45px` with left/start editorial description and CTAs, and right/end uppercase headline (`DRIVE BEYOND ORDINARY.`).
  * Mobile Compact Flow: `.hero` releases full-screen viewport locking (`min-height: auto;`) and `.hero-bottom` flows directly below the car with a tight ~14–18px gap, naturally exposing the workshop metrics and services section in the lower portion of the initial viewport.
* **Animation Suite:**
  * `titleReveal`: Background typography entrance (1.2s ease-out).
  * `carReveal`: Upward scale entrance (1.3s cubic ease-out).
  * `carFloat`: Continuous 6s ease-in-out breathing float effect.
  * `contentReveal`: Staggered description (0.7s) and headline (1.0s) reveals.
  * Decoupled mouse & scroll parallax that smoothly combines with CSS keyframes without overriding.
* **Dual Action CTAs:** Primary button (`EXPLORE OUR SERVICES`) with hover amber transition (`#D97706`) and arrow micro-interaction, alongside secondary ghost button (`VIEW OUR WORK`).
* **Full Bilingual & Responsive Layout:** Desktop, tablet, mobile (768px), small mobile (420px), and short landscape screens with full RTL Arabic support and `prefers-reduced-motion` compliance.

### 2.2C Official Brand Crest & Identity System
* **Authentic Brand Crest Ingestion:** Official metallic chrome shield emblem with mechanical spider crest, electric cyan supercar with glowing headlights, chrome `SPEEDER`, cyan `SPIDER®`, and `DRIVE BEYOND ORDINARY` tagline.
* **Sitewide Integration:**
  * **Header Brand Mark:** Replaced wrench icon with `speederspider-crest-car.webp` with interactive hover scale and cyan glow.
  * **Footer Brand Anchor:** Displays full official `speederspider-shield-full.webp` crest above workshop description.
  * **Admin Layout & Login:** Integrated official crest into admin portal navigation and login experience.
  * **Browser Tab Favicons:** Generated crisp 32x32 `favicon.ico`, 192x192 `icon.png`, and 180x180 `apple-icon.png`.
  * **OpenGraph & Twitter Cards:** Integrated official logo as primary social sharing visual.

### 2.3 Interactive Before-and-After Comparison Slider
* Allows clients to visually evaluate SpeederSpider's transformation craftsmanship (e.g. multi-stage paint correction, leather upholstery restoration).
* **Controls:**
  * Desktop: Mouse drag horizontally across the cyan divider.
  * Mobile: Touch swipe horizontally; built-in touch listeners prevent unintended vertical page scrolling during slider operation.
  * Keyboard: Left and Right arrow keys allow accessible stepping.
* Automatic aspect ratio preservation prevents Cumulative Layout Shift (CLS).

### 2.4 Instant WhatsApp Click-to-Chat (`0565694440`)
* WhatsApp contact actions are available in the top navigation, service pages, and as a floating action button on mobile.
* Clicking opens a direct conversation with SpeederSpider using international format `+971565694440`.
* Messages are automatically prefilled in the client's selected language:
  * **English:** *"Hello SpeederSpider! I visited your website and would like to enquire about your automotive services."*
  * **Arabic:** *"مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات."*

### 2.5 Customer Consultation & Enquiry Form
* Validates customer name, email address, phone number, and service interest.
* Protected by an anti-spam honeypot mechanism and server-side rate-limiting.
* Saves submissions to the `contact_messages` database table and alerts workshop management via email.

### 2.6 Dubai Workshop Location & Map Embed
* Official physical workshop address prominently displayed: `Al Asayel St - Al Qouz Ind. Second - Al Quoz - Dubai`.
* Embedded interactive map centered on the workshop premises with a direct "Navigate via Google Maps" button for instant GPS turn-by-turn routing.

### 2.7 "Rate Us on Google" CTA Integration
* Displays a branded Google Review call-to-action button with authentic Google icon and star rating indicators across the Footer, Contact Page, and Testimonials section.
* Driven by a dynamic administrative setting stored in `site_settings`. When no review URL is configured, the button remains disabled or hidden to maintain trust and prevent dead navigation.

---

## 3. The 7 Core Automotive Disciplines (With Dedicated Before & After Comparisons)

Every service discipline features a dedicated before-and-after visual comparison slider allowing customers to evaluate actual craftsmanship:

1. **Custom Automotive Upholstery (`/services/upholstery`):** Bespoke Nappa leather seats, steering wheel wraps, Alcantara roof lining, and diamond stitching. Includes Before/After slider showcasing leather restoration.
2. **Detailing & Multi-Stage Polishing (`/services/detailing-polishing`):** Compound paint correction, 9H ceramic coatings, interior deep sanitation. Features multi-stage swirl removal comparison.
3. **Nanoceramic Window Tinting (`/services/window-tinting`):** High infrared heat rejection films designed for Dubai summer heat. Shows clarity and UV/heat reduction tinting transformation.
4. **Automotive Electrical Diagnostics (`/services/electrical`):** CAN-bus troubleshooting, ECU module repairs, and sensor calibrations. Features wiring harness restoration comparison.
5. **Mechanical Maintenance & Overhauls (`/services/mechanical`):** Powertrain servicing, brake renewals, and suspension tuning. Features performance brake caliper overhaul before/after.
6. **Multimedia & Sound Systems (`/services/multimedia`):** Wireless Apple CarPlay, 360 surround-view cameras, DSP audio tuning. Displays OEM infotainment screen upgrades.
7. **Denting, Spray Painting & Bodywork (`/services/denting-painting`):** Paintless dent repair (PDR), spectrophotometer color matching, and dust-free baking booth refinishing. Shows high-precision quarter panel dent restoration.

---

## 4. Administrative Workshop Portal (`/admin`)

The admin portal is protected and enforces role-based access control.

### 4.1 Multi-Role Access Control
* **OWNER:** Full platform access, security audit log access (`/admin/audit-logs`), inventory control, user role oversight.
* **MANAGER:** Content management (Services, Portfolio, Testimonials), inventory stock adjustments, and customer enquiry triage.
* **STAFF:** Stock-In/Stock-Out logging and customer enquiry viewing/status updates.

### 4.2 Dashboard Overview (`/admin`)
* Real-time metrics tracking: Total Services, Published Projects, Customer Enquiries, and Low-Stock Alert Count.
* **Low-Stock Alert Banner:** Automatically activates when any consumable item drops to or below its minimum threshold.

### 4.3 Service Management (`/admin/services`)
* View all services, toggle published/draft status, and edit bilingual titles and descriptions.
* Configure display order and featured imagery.

### 4.4 Portfolio & Showcase Management (`/admin/portfolio`)
* Add new completed vehicle projects with live image previews for Before & After paired imagery.
* Provide Short Summaries (EN & AR) rendered on public showcase cards, and Full Scope Descriptions (EN & AR) rendered on dedicated project detail pages.
* Configure Vehicle Make, Model, Year, and technical SEO Title & Description tags.
* Toggle "Featured" badge to display prominently on the homepage, and switch between Published and Draft states.

### 4.5 Internal Workshop Inventory (`/admin/inventory`)
* **Strictly Internal:** Inventory is not exposed to the public. Zero mock data or automatic demo items are injected.
* **Manual Item Creation:** Click "Add Inventory Item" to enter real workshop materials with:
  * Name in English and Arabic.
  * SKU / Part code (with optional one-click unique SKU generator).
  * Category selector.
  * Initial on-hand stock and minimum low-stock alert threshold.
  * Unit cost price in AED, supplier name, and physical workshop storage bay.
  * Status (`active`, `discontinued`, `archived`).
* **Item Editing & Deletion:** In-line editing modal for any field, and safe permanent item deletion with confirmation modal.
* **Atomic Stock Transactions:**
  * **Stock-In (+):** Records deliveries from suppliers with quantities and notes.
  * **Stock-Out (-):** Deducts consumables used on customer vehicle jobs. Validates stock to prevent negative balances.
  * **Manual Adjustment:** Allows reconciliation after physical workshop audits with mandatory reason logging.
  * **Audit Trail:** Append-only transaction log recording resulting quantities, timestamps, and performing users.

### 4.6 Contact Message Management (`/admin/enquiries`)
* Unified triage inbox for customer leads.
* Filter by status: `New`, `In Progress`, `Contacted`, `Completed`, `Archived`.
* View detailed vehicle requirements and save internal workshop notes (e.g. quote amounts, VIN numbers, scheduled appointment dates).

### 4.7 Security & Audit Logs (`/admin/audit-logs`)
* Restricted exclusively to the `OWNER` role.
* Tracks administrative events, inventory movements, and login events with IP addresses.

### 4.8 Google Review Settings (`/admin`)
* Configured from the Admin Overview dashboard.
* Allows workshop administrators to set or update the official Google Business Profile review URL.
* Offers a "Test Link" button to verify the URL in a new tab before saving.
* Automatically activates the "Rate Us on Google" CTA across the public website once saved.

### 4.9 Simple Business Money & Payment Tracker (`/admin/payments`)
A purpose-built, lightweight financial management module designed for manual cash tracking without complex ERP overhead or automated dummy entries.
* **Core Business Questions Answered:**
  1. *How much money has come into the business?* (`Total Income`)
  2. *How much money has gone out?* (`Total Expenses`)
  3. *How much money have I personally taken out?* (`Total Owner Withdrawals`)
  4. *How much money have I invested in the business?* (`Total Owner Contributions`)
  5. *What is the current net operating cash flow?* (`Net Operating Cash Flow = Total Income - Total Expenses`)
  6. *What is the actual net cash movement?* (`Net Cash Movement = Income + Contributions - Expenses - Withdrawals`)
  7. *Where exactly is the money being spent?* (Real-time category spending breakdown with percentage bars)
* **Transaction Types Supported:**
  * **INCOME:** Customer payments, service revenue, product sales, consulting/inspections.
  * **EXPENSE:** Inventory purchases, workshop rent, electricity & utilities, equipment & tools, marketing & ads, staff & salaries, maintenance & repairs, fuel & transport, office supplies.
  * **OWNER_WITHDRAWAL:** Personal drawings, profit share, owner distributions. (Tracked strictly separately from operating business expenses).
  * **OWNER_CONTRIBUTION:** Initial capital, additional personal injections, emergency funding, loans. (Tracked strictly separately from customer income).
* **Date Filtering & Presets:**
  * One-click presets: *Today*, *This Week*, *This Month*, *Last Month*, *Custom Date Range*, *All Time*.
  * Calculations dynamically reflect the selected period.
* **Dynamic Category Management:**
  * Pre-populated with relevant workshop categories based on the selected transaction type.
  * Choosing "Other" instantly presents a custom category input for granular labeling.
* **Data Security & Integrity:**
  * Financial amounts are stored as exact `numeric(12,2)` in AED (never floating point).
  * Restricted exclusively to `OWNER` and `MANAGER` roles via server-side session authentication.
  * Immutable audit logging captures all transaction creations, updates, and deletions with user ID and timestamp.
* **Exporting & Reporting:**
  * Built-in CSV export generator downloads the currently filtered transaction records with formatting preserved (`speeder-spider-transactions-[date].csv`).

---

## 5. Google Drive Media Integration Guide

When using photography or video hosted on Google Drive:
1. Set the file's sharing permission to **"Anyone with the link can view"**.
2. Copy the share link and paste it into the admin media URL field.
3. The platform's built-in media bridge (`src/lib/media/drive.ts`) automatically extracts the file ID and streams high-resolution optimized web thumbnails (`w1600`) while preserving responsive loading and aspect ratios.

---

## 6. Technical Maintenance & Troubleshooting

* **Running Type Check:** `npm run type-check` (verifies 0 TypeScript errors).
* **Creating a Production Build:** `npm run build` (generates optimized SSR/SSG bundles).
* **Starting the Server:** `npm run start` (starts production server on port 3000).
* **Environment Variables:** Documented in `.env.example`.
