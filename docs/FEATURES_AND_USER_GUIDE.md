# SpeederSpider - Features & Operations User Guide

**Document Classification:** Mandatory Document B (Business Owner & Operations Manual)  
**Target Audience:** SpeederSpider Management, Workshop Managers, Inventory Clerks, and Technicians.  
**System Version:** v1.0.0-production-ready

---

## 1. Overview of the Platform
SpeederSpider is a premier automotive repair, maintenance, detailing, and customization digital platform based in Dubai, UAE (Coordinates: `25.140657502467402, 55.24151547185268`).

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
* Embedded Google Map centered on workshop coordinates: `25.140657502467402, 55.24151547185268`.
* Provides a one-click "Navigate via Google Maps" button for easy GPS routing.

---

## 3. The 7 Core Automotive Disciplines

The platform manages and showcases seven distinct services:

1. **Custom Automotive Upholstery (`/services/upholstery`):** Bespoke Nappa leather seats, steering wheel wraps, Alcantara roof lining, and diamond stitching.
2. **Detailing & Multi-Stage Polishing (`/services/detailing-polishing`):** Compound paint correction, 9H ceramic coatings, interior deep sanitation.
3. **Nanoceramic Window Tinting (`/services/window-tinting`):** High infrared heat rejection films designed for Dubai summer heat.
4. **Automotive Electrical Diagnostics (`/services/electrical`):** CAN-bus troubleshooting, ECU module repairs, and sensor calibrations.
5. **Mechanical Maintenance & Overhauls (`/services/mechanical`):** Powertrain servicing, brake renewals, and suspension tuning.
6. **Multimedia & Sound Systems (`/services/multimedia`):** Wireless Apple CarPlay, 360 surround-view cameras, DSP audio tuning.
7. **Denting, Spray Painting & Bodywork (`/services/denting-painting`):** Paintless dent repair (PDR), spectrophotometer color matching, and dust-free baking booth refinishing.

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
* Add new completed vehicle projects.
* Upload or link Before and After images.
* Toggle "Featured" badge to display prominently on the homepage.

### 4.5 Internal Workshop Inventory (`/admin/inventory`)
* **Strictly Internal:** Inventory is not exposed to the public.
* **Features:**
  * Real-time search across SKUs, item names, and suppliers.
  * Category filtering (Leather & Fabric, Detailing, Tint Films, Electrical, Fluids).
  * **Low-Stock Filter:** Isolate supplies requiring urgent reordering.
  * **Stock-In (+):** Records deliveries from suppliers with quantities and notes.
  * **Stock-Out (-):** Deducts consumables used on customer vehicle jobs. Validates stock to prevent negative quantities.
  * **Manual Adjustment:** Allows reconciliation after physical workshop audits with mandatory reason logging.
  * **Audit Trail:** Append-only transaction log recording resulting quantities, timestamps, and performing users.

### 4.6 Contact Message Management (`/admin/enquiries`)
* Unified triage inbox for customer leads.
* Filter by status: `New`, `In Progress`, `Contacted`, `Completed`, `Archived`.
* View detailed vehicle requirements and save internal workshop notes (e.g. quote amounts, VIN numbers, scheduled appointment dates).

### 4.7 Security & Audit Logs (`/admin/audit-logs`)
* Restricted exclusively to the `OWNER` role.
* Tracks administrative events, inventory movements, and login events with IP addresses.

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
