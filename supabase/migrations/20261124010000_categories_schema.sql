-- =============================================================================
-- SpeederSpider Automotive Platform - Unified Categories Table Migration
-- Migration Timestamp: 2026-11-24T01:00:00Z
-- =============================================================================

-- 1. Create the unified categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name_en ON public.categories(name_en);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Anyone can view categories
CREATE POLICY "Public can view categories"
    ON public.categories
    FOR SELECT
    USING (true);

-- 2. Staff, managers, and owners can manage categories
CREATE POLICY "Managers and owners can insert categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_manager_or_above());

CREATE POLICY "Managers and owners can update categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (public.is_manager_or_above())
    WITH CHECK (public.is_manager_or_above());

CREATE POLICY "Managers and owners can delete categories"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (public.is_manager_or_above());

-- Grant privileges
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

-- 2. Migrate existing records from inventory_categories if present
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_categories') THEN
        INSERT INTO public.categories (id, name_en, name_ar, slug, description, created_at)
        SELECT id, name_en, name_ar, slug, description, created_at
        FROM public.inventory_categories
        ON CONFLICT (slug) DO UPDATE
        SET 
            name_en = EXCLUDED.name_en,
            name_ar = EXCLUDED.name_ar,
            description = EXCLUDED.description;
    END IF;
END $$;

-- 3. Seed unified categories catalog
INSERT INTO public.categories (name_en, name_ar, slug, description)
VALUES
(
    'Multimedia & Audio',
    'أنظمة الصوت والشاشات',
    'multimedia-audio',
    'CarPlay boxes, Android DVD dashboard systems, multimedia adapters, and audio upgrades.'
),
(
    'Window Films',
    'أفلام التظليل والعزل',
    'window-films',
    '3M and nanoceramic automotive window tinting, heat rejection films, and tools.'
),
(
    'Security & Tracking',
    'أنظمة التتبع والأمان',
    'security-tracking',
    'GSM vehicle GPS trackers, remote monitoring modules, and security sensors.'
),
(
    'Automotive Lighting',
    'إضاءة ومصابيح السيارات',
    'automotive-lighting',
    'High-intensity LED projector bulbs, fog lights, and ambient cabin illumination.'
),
(
    'Accessories & Upgrades',
    'إكسسوارات وترقيات السيارات',
    'accessories-upgrades',
    'Portable car fridges, cabin organizers, wireless chargers, and custom vehicle gadgets.'
),
(
    'Leather & Fabric',
    'الجلود والأقمشة',
    'leather-fabric',
    'Automotive hides, Nappa leather, Alcantara, thread spools, and adhesives.'
),
(
    'Detailing & Coatings',
    'مواد التلميع والنانو',
    'detailing-coatings',
    'Ceramic coatings, cutting compounds, polishing pads, microfibers, and sealants.'
),
(
    'Electrical Spares',
    'قطع الكهرباء والحساسات',
    'electrical-spares',
    'Relays, fuses, wiring looms, sensors, and electronic control connectors.'
),
(
    'Fluids & Filters',
    'الزيوت والفلاتر',
    'fluids-filters',
    'Synthetic motor oils, brake pads, filters, spark plugs, and coolants.'
),
(
    'Paints & Bodywork',
    'دهانات ومواد السمكرة',
    'paints-bodywork',
    'Primers, basecoats, clearcoats, body fillers, abrasives, and masking tape.'
)
ON CONFLICT (slug) DO UPDATE
SET
    name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());
