# SpeederSpider - Database Schema & Supabase Architecture

**Project:** SpeederSpider Automotive Digital Platform  
**Document Classification:** Technical Database Specification

---

## 1. Relational Entity Overview

The SpeederSpider database is structured to support bilingual content, granular administrative role enforcement, atomic inventory transaction auditing, and customer contact management.

```
       +-----------------------+              +---------------------------+
       |      auth.users       |              |           roles           |
       +-----------------------+              +---------------------------+
                   | 1                                      | 1
                   |                                        |
                   | 1                                      | M
       +-----------------------+              +---------------------------+
       |       profiles        |<-------------|     user_roles / role     |
       +-----------------------+              +---------------------------+
         |           |           |
         | performs  | performs  | performs
         v           v           v
  +--------------+ +-----------+ +--------------+
  |  inventory_  | | contact_  | |  audit_logs  |
  | transactions | | internal  | +--------------+
  +--------------+ |   notes   |
         |         +-----------+
         | relates
         v
  +--------------+
  |  inventory_  |
  |    items     |<--- belongs to --- [inventory_categories]
  +--------------+

  +--------------+
  |   services   |<--- referenced by --- [portfolio_projects] <--- [portfolio_images]
  +--------------+

  +--------------+
  | testimonials |
  +--------------+

  +--------------+
  |site_settings |
  +--------------+
```

---

## 2. Table Specifications

### 2.1 `profiles`
Links directly to Supabase Auth `auth.users` through a primary foreign key.
* `id` UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
* `role` VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff'))
* `full_name` TEXT NOT NULL
* `email` TEXT NOT NULL UNIQUE
* `phone` TEXT
* `avatar_url` TEXT
* `is_active` BOOLEAN NOT NULL DEFAULT true
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
* `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.2 `services`
Stores the 7 core automotive service offerings with bilingual content and SEO metadata.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `slug_en` VARCHAR(100) NOT NULL UNIQUE
* `slug_ar` VARCHAR(100) NOT NULL UNIQUE
* `title_en` VARCHAR(150) NOT NULL
* `title_ar` VARCHAR(150) NOT NULL
* `short_desc_en` TEXT NOT NULL
* `short_desc_ar` TEXT NOT NULL
* `description_en` TEXT NOT NULL
* `description_ar` TEXT NOT NULL
* `icon_name` VARCHAR(50) NOT NULL DEFAULT 'Wrench'
* `featured_image` TEXT NOT NULL
* `gallery_images` TEXT[] DEFAULT '{}'
* `seo_title_en` VARCHAR(160)
* `seo_title_ar` VARCHAR(160)
* `seo_desc_en` VARCHAR(255)
* `seo_desc_ar` VARCHAR(255)
* `display_order` INTEGER NOT NULL DEFAULT 0
* `is_published` BOOLEAN NOT NULL DEFAULT true
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
* `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

*Core Services Pre-Seeded:*
1. Upholstery (`upholstery`)
2. Detailing & Polishing (`detailing-polishing`)
3. Window Tinting (`window-tinting`)
4. Electrical (`electrical`)
5. Mechanical (`mechanical`)
6. Multimedia (`multimedia`)
7. Denting & Painting (`denting-painting`)

### 2.3 `portfolio_projects`
Showcases completed transformations with interactive Before/After image pairings.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `slug` VARCHAR(150) NOT NULL UNIQUE
* `service_id` UUID REFERENCES services(id) ON DELETE SET NULL
* `title_en` VARCHAR(200) NOT NULL
* `title_ar` VARCHAR(200) NOT NULL
* `desc_en` TEXT NOT NULL
* `desc_ar` TEXT NOT NULL
* `vehicle_make` VARCHAR(100)
* `vehicle_model` VARCHAR(100)
* `vehicle_year` VARCHAR(10)
* `before_image` TEXT NOT NULL
* `after_image` TEXT NOT NULL
* `gallery_images` TEXT[] DEFAULT '{}'
* `video_url` TEXT
* `is_featured` BOOLEAN NOT NULL DEFAULT false
* `is_published` BOOLEAN NOT NULL DEFAULT true
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
* `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.4 `testimonials`
Authentic client reviews and feedback.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `client_name_en` VARCHAR(150) NOT NULL
* `client_name_ar` VARCHAR(150) NOT NULL
* `vehicle_info` VARCHAR(150)
* `rating` INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
* `review_en` TEXT NOT NULL
* `review_ar` TEXT NOT NULL
* `avatar_url` TEXT
* `is_published` BOOLEAN NOT NULL DEFAULT true
* `display_order` INTEGER NOT NULL DEFAULT 0
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.5 `inventory_categories`
Classification for workshop consumables, paints, leather, tint rolls, and mechanical spares.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `name_en` VARCHAR(100) NOT NULL
* `name_ar` VARCHAR(100) NOT NULL
* `slug` VARCHAR(100) NOT NULL UNIQUE
* `description` TEXT
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.6 `inventory_items`
Internal stock tracker for supplies and parts.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `sku` VARCHAR(50) NOT NULL UNIQUE
* `name_en` VARCHAR(150) NOT NULL
* `name_ar` VARCHAR(150) NOT NULL
* `category_id` UUID REFERENCES inventory_categories(id) ON DELETE RESTRICT
* `description` TEXT
* `quantity` INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
* `min_threshold` INTEGER NOT NULL DEFAULT 5 CHECK (min_threshold >= 0)
* `cost_price` NUMERIC(10, 2) NOT NULL DEFAULT 0.00
* `supplier` VARCHAR(150)
* `storage_location` VARCHAR(100)
* `status` VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'archived'))
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
* `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.7 `inventory_transactions`
Auditable append-only log of stock entries, consumption, and physical count corrections.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `item_id` UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE
* `transaction_type` VARCHAR(20) NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment'))
* `quantity_changed` INTEGER NOT NULL
* `resulting_quantity` INTEGER NOT NULL
* `reason` TEXT NOT NULL
* `performed_by` UUID REFERENCES profiles(id) ON DELETE SET NULL
* `notes` TEXT
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.8 `contact_messages`
Customer enquiries submitted via the public contact form.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `customer_name` VARCHAR(150) NOT NULL
* `email` VARCHAR(255) NOT NULL
* `phone` VARCHAR(50) NOT NULL
* `service_id` UUID REFERENCES services(id) ON DELETE SET NULL
* `message` TEXT NOT NULL
* `preferred_language` VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar'))
* `status` VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'completed', 'archived'))
* `internal_notes` TEXT
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
* `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.9 `site_settings`
Global business configuration and contact references.
* `key` VARCHAR(50) PRIMARY KEY
* `value` JSONB NOT NULL
* `description` TEXT
* `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 2.10 `audit_logs`
Security log for administrative events.
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `user_id` UUID REFERENCES profiles(id) ON DELETE SET NULL
* `action` VARCHAR(50) NOT NULL
* `entity_type` VARCHAR(50) NOT NULL
* `entity_id` VARCHAR(100)
* `details` JSONB
* `ip_address` VARCHAR(45)
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

---

## 3. Row Level Security (RLS) Policies

* **Public Read Access:**
  * `services`: Visible only where `is_published = true`.
  * `portfolio_projects`: Visible only where `is_published = true`.
  * `testimonials`: Visible only where `is_published = true`.
  * `site_settings`: Selected public keys only (`contact_number`, `coordinates`, `social_links`).
* **Public Write Access:**
  * `contact_messages`: Insert permitted after server-side validation.
* **Internal Admin Access:**
  * `inventory_items`, `inventory_categories`, `inventory_transactions`: Accessible exclusively to authenticated users with `role IN ('owner', 'manager', 'staff')`.
  * Write access to `services` and `portfolio_projects`: Restricted to `role IN ('owner', 'manager')`.
  * User provisioning & `audit_logs`: Restricted exclusively to `role = 'owner'`.
