# SpeederSpider - Search Engine Optimization (SEO) Specification

**Priority:** Highest Business Priority  
**Target Geo:** Dubai and Northern Emirates, United Arab Emirates  
**Languages:** English (`en`) & Arabic (`ar`)

---

## 1. Technical SEO Foundation

### 1.1 Architecture & Crawlability
* **Rendering Strategy:** Static Generation with Incremental Static Regeneration (ISR) and Server-Side Rendering (SSR) for all public-facing pages ensuring 100% crawlable raw HTML content.
* **Bilingual URL Routing:** Dedicated top-level subpaths:
  * English: `https://speederspider.com/en/...`
  * Arabic: `https://speederspider.com/ar/...`
* **Language Alternates (`hreflang`):**
  Every localized page provides bidirectional `<link rel="alternate" hreflang="..." />` tags including `x-default`:
  ```html
  <link rel="alternate" hreflang="en" href="https://speederspider.com/en/services/upholstery" />
  <link rel="alternate" hreflang="ar" href="https://speederspider.com/ar/services/upholstery" />
  <link rel="alternate" hreflang="x-default" href="https://speederspider.com/en/services/upholstery" />
  ```
* **Canonical URL Enforcement:** Every route enforces a self-referencing absolute canonical URL to prevent parameter-based duplication.
* **Dynamic XML Sitemap:** Automatically generated at `/sitemap.xml` containing all published service pages, portfolio projects, and core pages for both `en` and `ar` with `lastmod` timestamps. Excludes all `/admin/*` and private endpoints.
* **Robots.txt:** Generated dynamically at `/robots.txt` allowing public indexing of `/en/` and `/ar/`, referencing `/sitemap.xml`, and strictly disallowing `/admin/`, `/api/`, and private directories.

---

## 2. Local & Automotive Keyword Mapping (Dubai Focus)

| Service Area | English Target Keywords | Arabic Target Keywords |
|---|---|---|
| **Brand Primary** | SpeederSpider Dubai, Luxury Car Workshop Dubai | سبيدر سبايدر دبي، ورشة سيارات فاخرة دبي |
| **Upholstery** | Car upholstery Dubai, leather car seat repair Dubai, automotive interior customization | تنجيد سيارات دبي، تنجيد جلد طبيعي للسيارات، تعديل مقصورة السيارة |
| **Detailing & Polishing** | Car detailing Dubai, ceramic coating Dubai, paint correction Dubai | تلميع سيارات دبي، نانو سيراميك للسيارات دبي، تصحيح طلاء السيارات |
| **Window Tinting** | Car window tinting Dubai, ceramic heat rejection tint, legal tint Dubai | تظليل سيارات دبي، عازل حراري نانو سيراميك دبي، مخفي سيارات دبي |
| **Electrical** | Car electrical repair Dubai, automotive diagnostics, ECU fault diagnosis | تصليح كهرباء سيارات دبي، فحص كمبيوتر وبرمجة سيارات دبي |
| **Mechanical** | Car mechanical repair Dubai, engine service, suspension and brakes Dubai | صيانة ميكانيكية سيارات دبي، تصليح محركات، صيانة فرامل ومساعدات |
| **Multimedia** | Car multimedia installation Dubai, Apple CarPlay Android Auto upgrade | تركيب شاشات سيارات دبي، ترقية نظام كاربلاي وأندرويد أوتو |
| **Denting & Painting** | Car dent repair Dubai, paintless dent repair PDR, automotive spray painting Dubai | تعديل صدمات بدون بوية دبي، سمكرة ورش دهان سيارات دبي |

---

## 3. Structured Data (Schema.org) Implementation

Each page type injects JSON-LD structured data:

### 3.1 LocalBusiness / AutoRepair Schema
Applied across all root pages:
```json
{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "SpeederSpider",
  "image": "https://speederspider.com/brand/speederspider-logo.png",
  "telephone": "+971565694440",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 25.140657502467402,
    "longitude": 55.24151547185268
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "20:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/share/1EFvDZmQN6/",
    "https://www.instagram.com/speeder_spider?evlk=MWw5YnQ5YmdqYWowbg=="
  ]
}
```

### 3.2 Service Schema
Injected into each service detail page (`/en/services/[slug]` and `/ar/services/[slug]`) linking service provider, area served (Dubai), and description.

### 3.3 BreadcrumbList Schema
Injected into all hierarchical pages for enhanced search engine result snippets.

---

## 4. Performance & Core Web Vitals Optimization
* **Largest Contentful Paint (LCP):** Target < 2.5s. Optimized hero banner images with responsive `sizes` attribute, WebP/AVIF formats, and priority preloading.
* **Interaction to Next Paint (INP):** Target < 200ms. Minimal client JavaScript payload; defer non-critical interactive components.
* **Cumulative Layout Shift (CLS):** Target < 0.05. Fixed aspect ratio containers on all vehicle photos and before/after comparison frames.
