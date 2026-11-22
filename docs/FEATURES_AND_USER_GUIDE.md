# SpeederSpider - Features & Operations User Guide

**Document Classification:** Mandatory Document B (Business Owner & Operations Manual)  
**Target Audience:** SpeederSpider Management, Workshop Managers, Inventory Clerks, and Web Administrators.  
**System Version:** v1.0.0-planning

---

## 1. Overview of the Platform
SpeederSpider is a premier automotive repair, maintenance, detailing, and customization digital platform based in Dubai, UAE. The platform serves two primary user groups:
1. **Public Website Visitors:** Potential and returning clients in Dubai and nearby Emirates seeking high-end automotive craftsmanship (Upholstery, Detailing & Polishing, Window Tinting, Electrical, Mechanical, Multimedia, Denting & Painting).
2. **SpeederSpider Staff & Management:** Internal operators managing service offerings, project portfolios, customer reviews, contact enquiries, and workshop inventory.

---

## 2. Public Website Capabilities

### 2.1 Language Switching (English / Arabic)
* The platform features a language toggle in the header navigation.
* Selecting Arabic switches the interface to a full Right-to-Left (RTL) experience with localized typography, flipped navigation, and cultural alignment.
* Both languages maintain dedicated URLs (e.g. `/en/services` and `/ar/services`) for search engine discoverability.

### 2.2 Interactive Before-and-After Comparison Slider
* Allows prospective clients to visually evaluate SpeederSpider's transformation work (e.g. interior upholstery restoration, exterior paint correction).
* Interactive controls:
  * Drag slider left or right on desktop using mouse or trackpad.
  * Swipe horizontally on mobile devices without interfering with vertical page scrolling.
  * Keyboard arrow navigation support (`Left` / `Right`) when focused.

### 2.3 Instant WhatsApp Click-to-Chat
* Floating contact button and dedicated CTA buttons on service pages initiate a direct WhatsApp conversation with the workshop (`0565694440`).
* Prefilled messages are automatically selected based on the active language:
  * **English:** *"Hello SpeederSpider! I visited your website and would like to enquire about your automotive services."*
  * **Arabic:** *"مرحباً SpeederSpider! زرت موقعكم الإلكتروني وأرغب في الاستفسار عن خدمات السيارات."*

### 2.4 Customer Enquiry Form
* Allows customers to request a consultation or quote.
* Collects: Name, Email, Phone number, Service of interest, Preferred language, and Custom requirements.
* Validates inputs, stores submissions securely in the database, and alerts staff via automated email.

---

## 3. Administrative Portal (`/admin`)

### 3.1 Access & Multi-Role Permissions
Administrative access requires authentication. The platform enforces three distinct access tiers:
1. **OWNER:**
   * Full platform visibility.
   * Admin user provisioning and privilege management.
   * Access to security and audit logs.
   * Full content and inventory authority.
2. **MANAGER:**
   * Content management (Services, Portfolio, Testimonials).
   * Inventory oversight (Stock entries, deductions, threshold management).
   * Enquiry management (Viewing, status changes, internal notes).
   * Cannot alter administrative security permissions or system settings.
3. **STAFF:**
   * Inventory transaction logging (Stock-in / Stock-out).
   * Viewing and updating customer enquiry statuses.
   * Restricted from altering core service descriptions, deleting records, or modifying users.

### 3.2 Services Management
* Add, edit, or archive any of the 7 core automotive services:
  1. Upholstery
  2. Detailing & Polishing
  3. Window Tinting
  4. Electrical
  5. Mechanical
  6. Multimedia
  7. Denting & Painting
* Manage bilingual titles, short summaries, comprehensive descriptions, featured photography, and gallery media.
* Customize display ordering and toggle draft/published status.

### 3.3 Portfolio & Project Showcase Management
* Upload showcase projects highlighting craftsmanship.
* Link projects to specific services.
* Provide paired Before and After image URLs (including Google Drive shared media format).
* Set projects as "Featured" to appear on the homepage showcase.

### 3.4 Internal Workshop Inventory System
* Designed exclusively for internal workshop stock control (not an ecommerce store).
* **Key Fields:** SKU / Item Code, Name (EN/AR), Category, Quantity on Hand, Reorder Minimum Threshold, Unit Cost, Supplier, and Storage Location.
* **Stock Transactions:**
  * **Stock In:** Increases inventory when parts or detailing supplies arrive from suppliers.
  * **Stock Out:** Deducts parts consumed during vehicle repairs or detailing jobs.
  * **Stock Adjustment:** Allows reconciliation after physical audits with mandatory reason logging.
* **Low-Stock Alerts:** Automatically flags items when quantity falls below the minimum threshold on the dashboard overview.

### 3.5 Contact Enquiry Management
* Unified inbox for customer submissions.
* Status tracking: `New` -> `In Progress` -> `Contacted` -> `Completed` -> `Archived`.
* Internal notes feature allows workshop managers to log quote amounts, vehicle VIN numbers, or scheduled visit dates.

---

## 4. Google Drive Media Guide
When utilizing Google Drive for website assets:
1. Ensure the Google Drive file or folder link sharing permission is set to **"Anyone with the link can view"**.
2. Paste the URL into the media manager. The system automatically converts standard Drive sharing links into high-performance web-compatible media references.
3. If a link becomes inaccessible or is deleted from Drive, the system displays a graceful automotive placeholder instead of broken UI layouts.

---

## 5. Security & Operations Best Practices
* Never share administrative credentials.
* Regularly review the low-stock alert dashboard before ordering supplies.
* Keep internal notes professional and accurate for each customer enquiry.
