-- =============================================================================
-- SpeederSpider Automotive Platform - Schema Enhancements Migration
-- Migration Timestamp: 2026-11-22T18:00:00Z
-- =============================================================================

-- 1. Add dedicated Before & After visual fields to services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS before_image TEXT,
ADD COLUMN IF NOT EXISTS after_image TEXT,
ADD COLUMN IF NOT EXISTS before_caption_en TEXT,
ADD COLUMN IF NOT EXISTS before_caption_ar TEXT,
ADD COLUMN IF NOT EXISTS after_caption_en TEXT,
ADD COLUMN IF NOT EXISTS after_caption_ar TEXT,
ADD COLUMN IF NOT EXISTS before_alt_en TEXT,
ADD COLUMN IF NOT EXISTS before_alt_ar TEXT,
ADD COLUMN IF NOT EXISTS after_alt_en TEXT,
ADD COLUMN IF NOT EXISTS after_alt_ar TEXT;

-- 2. Add short description and SEO fields to portfolio projects
ALTER TABLE public.portfolio_projects
ADD COLUMN IF NOT EXISTS short_desc_en TEXT,
ADD COLUMN IF NOT EXISTS short_desc_ar TEXT,
ADD COLUMN IF NOT EXISTS seo_title_en VARCHAR(160),
ADD COLUMN IF NOT EXISTS seo_title_ar VARCHAR(160),
ADD COLUMN IF NOT EXISTS seo_desc_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_desc_ar VARCHAR(255);

-- 3. Seed site_settings with Google Review configuration
INSERT INTO public.site_settings (key, value, description)
VALUES (
    'google_review_url',
    jsonb_build_object(
        'url', '',
        'is_enabled', false,
        'label_en', 'Rate Us on Google',
        'label_ar', 'قيّمنا على Google'
    ),
    'Configurable Google Review Business Profile link'
)
ON CONFLICT (key) DO NOTHING;
