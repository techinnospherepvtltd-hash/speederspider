-- =============================================================================
-- SpeederSpider Automotive Platform - Products Table Migration
-- Migration Timestamp: 2026-11-24T00:00:00Z
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug_en VARCHAR(150) NOT NULL,
    slug_ar VARCHAR(150) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200) NOT NULL,
    brand_en VARCHAR(100) NOT NULL DEFAULT 'Not specified',
    brand_ar VARCHAR(100) NOT NULL DEFAULT 'غير محدد',
    price_en VARCHAR(100) NOT NULL DEFAULT 'Price on Request',
    price_ar VARCHAR(100) NOT NULL DEFAULT 'السعر عند الطلب',
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Accessories',
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_published_order ON public.products(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_products_slug_en ON public.products(slug_en);
CREATE INDEX IF NOT EXISTS idx_products_slug_ar ON public.products(slug_ar);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Anyone (public anon & authenticated) can view published products
CREATE POLICY "Public can view published products"
    ON public.products
    FOR SELECT
    USING (is_published = true);

-- 2. Staff and above can view all products in admin portal
CREATE POLICY "Staff and above can view all products"
    ON public.products
    FOR SELECT
    TO authenticated
    USING (public.is_staff_or_above());

-- 3. Managers and Owners can manage products
CREATE POLICY "Managers and owners can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_manager_or_above());

CREATE POLICY "Managers and owners can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (public.is_manager_or_above())
    WITH CHECK (public.is_manager_or_above());

CREATE POLICY "Managers and owners can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (public.is_manager_or_above());

-- Grant privileges
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Seed the initial 8 products
INSERT INTO public.products (
    id, slug_en, slug_ar, name_en, name_ar, brand_en, brand_ar, price_en, price_ar, description_en, description_ar, image_url, category, display_order, is_published, is_featured
) VALUES
(
    'prod-1-car-play-box',
    'car-play-box',
    'car-play-box',
    'Car Play Box',
    'صندوق تشغيل السيارة',
    'Not specified',
    'غير محدد',
    'Price on Request',
    'السعر عند الطلب',
    'A compact multimedia device that enables smartphone connectivity and smart entertainment features in your car.',
    'جهاز وسائط متعددة صغير يتيح الاتصال بالهاتف الذكي والاستمتاع بميزات الترفيه الذكية داخل السيارة.',
    'https://lh3.googleusercontent.com/d/1w8rjoSwwScFK3IZ6Wb74MohxBJnZLdg7',
    'Multimedia',
    1,
    true,
    true
),
(
    'prod-2-tracking-system',
    'tracking-system-gsm',
    'tracking-system-gsm',
    'Tracking System with GSM Card',
    'نظام تتبع مع بطاقة GSM',
    'Not specified',
    'غير محدد',
    'Price on Request',
    'السعر عند الطلب',
    'A vehicle tracking device that uses GSM connectivity to support vehicle location monitoring and tracking.',
    'جهاز لتتبع المركبات يستخدم تقنية GSM لدعم مراقبة موقع السيارة وتتبعها.',
    'https://lh3.googleusercontent.com/d/1RE0j6QPA3-3NMhTJBX2XwH2lJAOQCBky',
    'Security & Tracking',
    2,
    true,
    true
),
(
    'prod-3-3m-window-film',
    '3m-window-film',
    '3m-window-film',
    '3M Window Film',
    'أفلام تظليل النوافذ من 3M',
    '3M',
    '3M',
    'Price on Request',
    'السعر عند الطلب',
    'Premium automotive window film designed to reduce heat and glare while providing UV protection and enhanced privacy.',
    'أفلام نوافذ عالية الجودة للسيارات مصممة لتقليل الحرارة والوهج مع توفير الحماية من الأشعة فوق البنفسجية وتعزيز الخصوصية.',
    'https://lh3.googleusercontent.com/d/1n0ONzEh_y_LRDLnLA7pw3BurWDrK9sMo',
    'Window Tinting',
    3,
    true,
    true
),
(
    'prod-4-led-light',
    'led-light',
    'led-light',
    'LED Light',
    'مصابيح LED للسيارات',
    'Not specified',
    'غير محدد',
    'Price on Request',
    'السعر عند الطلب',
    'Automotive LED lighting designed to provide bright illumination and improved visibility while driving.',
    'مصابيح LED للسيارات توفر إضاءة قوية ورؤية محسّنة أثناء القيادة.',
    'https://lh3.googleusercontent.com/d/1R6U_7PLld0azS4mHXY8WHF4FX3yICXs5',
    'Lighting',
    4,
    true,
    false
),
(
    'prod-5-car-fridge',
    'car-fridge',
    'car-fridge',
    'Car Fridge',
    'ثلاجة السيارة',
    'Not specified',
    'غير محدد',
    'Price on Request',
    'السعر عند الطلب',
    'A portable refrigerator designed to keep beverages and food cool during road trips and long journeys.',
    'ثلاجة محمولة مصممة للحفاظ على برودة المشروبات والأطعمة أثناء الرحلات والسفر لمسافات طويلة.',
    'https://lh3.googleusercontent.com/d/1_JrAFyI2oaw28QZvpt_zPqAEJ3hcmsD8',
    'Accessories',
    5,
    true,
    true
),
(
    'prod-6-gmc-dvd-player',
    'gmc-android-dvd-player-system',
    'gmc-android-dvd-player-system',
    'GMC Android DVD Player System',
    'نظام مشغل DVD أندرويد لسيارات GMC',
    'GMC',
    'جي إم سي',
    'Price on Request',
    'السعر عند الطلب',
    'An Android-based multimedia entertainment system designed for compatible GMC vehicle dashboards.',
    'نظام ترفيه ووسائط متعددة يعمل بنظام أندرويد ومصمم ليتناسب مع لوحات القيادة في سيارات GMC المتوافقة.',
    'https://lh3.googleusercontent.com/d/1hyyZUiIr57ppBQ7AtVpAL6Ukq24NGrwF',
    'Multimedia',
    6,
    true,
    false
),
(
    'prod-7-ford-dvd-player',
    'ford-android-dvd-player-system',
    'ford-android-dvd-player-system',
    'Ford Android DVD Player System',
    'نظام مشغل DVD أندرويد لسيارات فورد',
    'Ford',
    'فورد',
    'Price on Request',
    'السعر عند الطلب',
    'An Android multimedia entertainment system designed for compatible Ford vehicle dashboards.',
    'نظام ترفيه ووسائط متعددة يعمل بنظام أندرويد ومصمم ليتناسب مع لوحات القيادة في سيارات فورد المتوافقة.',
    'https://lh3.googleusercontent.com/d/15oCVQhF-EZ4-XMKZf0jRUmOfar6PWr6g',
    'Multimedia',
    7,
    true,
    false
),
(
    'prod-8-nissan-dvd-player',
    'nissan-android-dvd-player-system',
    'nissan-android-dvd-player-system',
    'Nissan Android DVD Player System',
    'نظام مشغل DVD أندرويد لسيارات نيسان',
    'Nissan',
    'نيسان',
    'Price on Request',
    'السعر عند الطلب',
    'An Android multimedia entertainment system designed for compatible Nissan vehicle dashboards.',
    'نظام ترفيه ووسائط متعددة يعمل بنظام أندرويد ومصمم ليتناسب مع لوحات القيادة في سيارات نيسان المتوافقة.',
    'https://lh3.googleusercontent.com/d/1f9RHXMxJX_WsOtvUt4T7xVxvIOd9DAUM',
    'Multimedia',
    8,
    true,
    false
)
ON CONFLICT (id) DO UPDATE
SET
    name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    brand_en = EXCLUDED.brand_en,
    brand_ar = EXCLUDED.brand_ar,
    price_en = EXCLUDED.price_en,
    price_ar = EXCLUDED.price_ar,
    description_en = EXCLUDED.description_en,
    description_ar = EXCLUDED.description_ar,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published,
    is_featured = EXCLUDED.is_featured,
    updated_at = timezone('utc'::text, now());
