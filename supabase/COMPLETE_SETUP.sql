-- =============================================================================
-- SpeederSpider Master Complete Database Setup Script
-- Project: SpeederSpider Automotive Workshop (Dubai)
-- Run this ONCE in Supabase SQL Editor to initialize all tables, RLS, and seed data.
-- =============================================================================

-- =============================================================================
-- SpeederSpider Automotive Platform - Initial Database Schema Migration
-- Migration Timestamp: 2026-11-22T17:00:00Z
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Profiles & Roles Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS helper functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner' AND is_active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager') AND is_active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff_or_above()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'staff') AND is_active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 2. Services Table (Bilingual EN / AR)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug_en VARCHAR(100) NOT NULL UNIQUE,
    slug_ar VARCHAR(100) NOT NULL UNIQUE,
    title_en VARCHAR(150) NOT NULL,
    title_ar VARCHAR(150) NOT NULL,
    short_desc_en TEXT NOT NULL,
    short_desc_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'Wrench',
    featured_image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    seo_title_en VARCHAR(160),
    seo_title_ar VARCHAR(160),
    seo_desc_en VARCHAR(255),
    seo_desc_ar VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 3. Portfolio Projects Table (Bilingual with Before & After Images)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL UNIQUE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    title_en VARCHAR(200) NOT NULL,
    title_ar VARCHAR(200) NOT NULL,
    desc_en TEXT NOT NULL,
    desc_ar TEXT NOT NULL,
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year VARCHAR(10),
    before_image TEXT NOT NULL,
    after_image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    video_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 4. Testimonials Table (Bilingual EN / AR)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name_en VARCHAR(150) NOT NULL,
    client_name_ar VARCHAR(150) NOT NULL,
    vehicle_info VARCHAR(150),
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    review_en TEXT NOT NULL,
    review_ar TEXT NOT NULL,
    avatar_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 5. Inventory Categories Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 6. Inventory Items Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    category_id UUID REFERENCES public.inventory_categories(id) ON DELETE RESTRICT,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_threshold INTEGER NOT NULL DEFAULT 5 CHECK (min_threshold >= 0),
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier VARCHAR(150),
    storage_location VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 7. Inventory Transactions Table (Append-Only Audit Log)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment')),
    quantity_changed INTEGER NOT NULL,
    resulting_quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Stored procedure for atomic stock transaction execution
CREATE OR REPLACE FUNCTION public.execute_stock_transaction(
    p_item_id UUID,
    p_transaction_type VARCHAR(20),
    p_quantity_change INTEGER,
    p_reason TEXT,
    p_performed_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_current_qty INTEGER;
    v_new_qty INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Acquire exclusive row lock on the inventory item
    SELECT quantity INTO v_current_qty
    FROM public.inventory_items
    WHERE id = p_item_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item not found';
    END IF;

    -- Calculate new quantity based on transaction type
    IF p_transaction_type = 'stock_in' THEN
        IF p_quantity_change <= 0 THEN
            RAISE EXCEPTION 'Stock in quantity must be positive';
        END IF;
        v_new_qty := v_current_qty + p_quantity_change;

    ELSIF p_transaction_type = 'stock_out' THEN
        IF p_quantity_change <= 0 THEN
            RAISE EXCEPTION 'Stock out quantity must be positive';
        END IF;
        IF v_current_qty < p_quantity_change THEN
            RAISE EXCEPTION 'Insufficient stock. Current stock is %', v_current_qty;
        END IF;
        v_new_qty := v_current_qty - p_quantity_change;

    ELSIF p_transaction_type = 'adjustment' THEN
        -- In adjustment, p_quantity_change is the target absolute quantity
        IF p_quantity_change < 0 THEN
            RAISE EXCEPTION 'Adjusted stock quantity cannot be negative';
        END IF;
        v_new_qty := p_quantity_change;
    ELSE
        RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
    END IF;

    -- Update inventory item
    UPDATE public.inventory_items
    SET quantity = v_new_qty, updated_at = timezone('utc'::text, now())
    WHERE id = p_item_id;

    -- Insert audit log
    INSERT INTO public.inventory_transactions (
        item_id, transaction_type, quantity_changed, resulting_quantity, reason, performed_by, notes
    ) VALUES (
        p_item_id, p_transaction_type, (v_new_qty - v_current_qty), v_new_qty, p_reason, p_performed_by, p_notes
    ) RETURNING id INTO v_transaction_id;

    RETURN jsonb_build_object(
        'success', true,
        'item_id', p_item_id,
        'previous_quantity', v_current_qty,
        'new_quantity', v_new_qty,
        'transaction_id', v_transaction_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 8. Contact Messages Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'completed', 'archived')),
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 9. Site Settings Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 10. Audit Logs Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; owners can view all; owners can update roles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Owners can view all profiles" ON public.profiles FOR SELECT USING (public.is_owner());
CREATE POLICY "Owners can update profiles" ON public.profiles FOR UPDATE USING (public.is_owner());

-- Services: Public can read published; managers & owners can perform all operations
CREATE POLICY "Public can view published services" ON public.services FOR SELECT USING (is_published = true);
CREATE POLICY "Staff can view all services" ON public.services FOR SELECT USING (public.is_staff_or_above());
CREATE POLICY "Managers and owners can insert services" ON public.services FOR INSERT WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can update services" ON public.services FOR UPDATE USING (public.is_manager_or_above());
CREATE POLICY "Owners can delete services" ON public.services FOR DELETE USING (public.is_owner());

-- Portfolio: Public can read published; managers & owners full CRUD
CREATE POLICY "Public can view published portfolio" ON public.portfolio_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Staff can view all portfolio" ON public.portfolio_projects FOR SELECT USING (public.is_staff_or_above());
CREATE POLICY "Managers and owners can insert portfolio" ON public.portfolio_projects FOR INSERT WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can update portfolio" ON public.portfolio_projects FOR UPDATE USING (public.is_manager_or_above());
CREATE POLICY "Owners can delete portfolio" ON public.portfolio_projects FOR DELETE USING (public.is_owner());

-- Testimonials: Public can read published
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Staff can view all testimonials" ON public.testimonials FOR SELECT USING (public.is_staff_or_above());
CREATE POLICY "Managers and owners can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can update testimonials" ON public.testimonials FOR UPDATE USING (public.is_manager_or_above());
CREATE POLICY "Owners can delete testimonials" ON public.testimonials FOR DELETE USING (public.is_owner());

-- Inventory: Completely hidden from public
CREATE POLICY "Staff and above can view inventory categories" ON public.inventory_categories FOR SELECT USING (public.is_staff_or_above());
CREATE POLICY "Managers and owners can edit inventory categories" ON public.inventory_categories FOR ALL USING (public.is_manager_or_above());

CREATE POLICY "Staff and above can view inventory items" ON public.inventory_items FOR SELECT USING (public.is_staff_or_above());
CREATE POLICY "Managers and owners can insert inventory items" ON public.inventory_items FOR INSERT WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can update inventory items" ON public.inventory_items FOR UPDATE USING (public.is_manager_or_above());
CREATE POLICY "Owners can delete inventory items" ON public.inventory_items FOR DELETE USING (public.is_owner());

CREATE POLICY "Staff and above can view transactions" ON public.inventory_transactions FOR SELECT USING (public.is_staff_or_above());
CREATE POLICY "Staff and above can insert transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (public.is_staff_or_above());

-- Contact Messages: Anyone can insert (subject to validation); only staff and above can view/update
CREATE POLICY "Public can insert contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff and above can view contact messages" ON public.contact_messages FOR SELECT USING (public.is_staff_or_above());
CREATE POLICY "Staff and above can update contact messages" ON public.contact_messages FOR UPDATE USING (public.is_staff_or_above());
CREATE POLICY "Owners can delete contact messages" ON public.contact_messages FOR DELETE USING (public.is_owner());

-- Site Settings: Public can read public keys; owners full control
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Owners can manage settings" ON public.site_settings FOR ALL USING (public.is_owner());

-- Audit Logs: Owners only
CREATE POLICY "Owners can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_owner());

-- -----------------------------------------------------------------------------
-- SEED DATA: 7 Core Automotive Services
-- -----------------------------------------------------------------------------
INSERT INTO public.services (
    slug_en, slug_ar, title_en, title_ar,
    short_desc_en, short_desc_ar,
    description_en, description_ar,
    icon_name, featured_image, display_order, is_published,
    seo_title_en, seo_title_ar, seo_desc_en, seo_desc_ar
) VALUES
(
    'upholstery',
    'upholstery',
    'Custom Automotive Upholstery',
    'تنجيد وتعديل مقصورة السيارات',
    'Bespoke leather craftsmanship, steering wheel restoration, roof lining, and interior rejuvenation in Dubai.',
    'صناعة جلدية فاخرة ومخصصة، تجديد المقود وبطانة السقف وتجديد شامل لمقصورة السيارة في دبي.',
    'SpeederSpider delivers bespoke automotive upholstery services tailored to luxury and performance vehicles. From OEM-grade leather seat restoration and Alcantara headliners to custom diamond stitching and dashboard re-trimming, our artisans bring precision craftsmanship to every interior contour.',
    'يقدم سبيدر سبايدر خدمات تنجيد سيارات مخصصة لأفخم السيارات الرياضية والفاخرة. من تجديد المقاعد الجلدية بأجود أنواع الجلد الطبيعي وسقف الكانتارا إلى التطريز الماسي وتجديد لوحة القيادة بحرفية ودقة متناهية.',
    'Sparkles',
    'https://images.unsplash.com/photo-1540829099868-e74c830a4b89?auto=format&fit=crop&w=1200&q=80',
    1, true,
    'Luxury Car Upholstery & Leather Restoration Dubai | SpeederSpider',
    'تنجيد سيارات فاخرة وتجديد مقاعد جلد دبي | سبيدر سبايدر',
    'Premier automotive upholstery in Dubai. Custom leather seats, Alcantara roof lining, steering wheel restoration, and luxury interior craftsmanship.',
    'أفضل خدمات تنجيد السيارات وتجديد الجلد في دبي. مقاعد جلد مخصصة، بطانة سقف الكانتارا، وتفصيل داخلي فاخر.'
),
(
    'detailing-polishing',
    'detailing-polishing',
    'Detailing & Multi-Stage Polishing',
    'التلميع وتصحيح الطلاء وحماية النانو',
    'Multi-stage paint correction, ceramic coating, deep interior sanitation, and high-gloss mirror finishes.',
    'تصحيح طلاء متعدد المراحل، حماية نانو سيراميك، تنظيف وتعقيم عميق للمقصورة، ولمعان كريستالي فائق.',
    'Our automotive detailing studio utilizes cutting-edge paint correction compounds and dual-action polishers to eliminate swirl marks, oxidation, and scratches. We seal surfaces with advanced ceramic coatings for durable hydrophobic protection against Dubai heat and sand.',
    'يستخدم استوديو التلميع لدينا في سبيدر سبايدر أحدث مركبات تصحيح الطلاء لإزالة الخدوش الدقيقة والبهتان والدوائر، مع تطبيق طبقات النانو سيراميك لتوفير حماية كارهة للماء تدوم طويلاً ضد حرارة ورمل دبي.',
    'Shield',
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
    2, true,
    'Car Detailing & Ceramic Coating Dubai | SpeederSpider',
    'تلميع سيارات وسيراميك دبي | سبيدر سبايدر',
    'Professional automotive detailing, multi-stage paint correction, and ceramic coating protection in Dubai.',
    'خدمات تلميع احترافية للسيارات، تصحيح طلاء متعدد المراحل وحماية نانو سيراميك في دبي.'
),
(
    'window-tinting',
    'window-tinting',
    'Nanoceramic Window Tinting',
    'تظليل السيارات والعازل الحراري',
    'High heat rejection nanoceramic films ensuring maximum UV protection and interior temperature reduction.',
    'أفلام نانو سيراميك عازلة للحرارة العالية توفر أقصى حماية من الأشعة فوق البنفسجية وتخفيض حرارة المقصورة.',
    'Engineered specifically for the intense UAE climate, our premium ceramic window films reject up to 99% of harmful ultraviolet rays and provide superior infrared heat reduction without interfering with mobile, GPS, or keyless signals.',
    'صُممت أفلام التظليل النانو سيراميك الفاخرة خصيصاً لمناخ الإمارات الحار، حيث تعزل حتى 99% من الأشعة فوق البنفسجية الضارة وتوفر خفضاً استثنائياً للحرارة دون التأثير على إشارات الجوال والملاحة.',
    'Sun',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    3, true,
    'Premium Car Window Tinting & Heat Rejection Dubai | SpeederSpider',
    'تظليل سيارات وعازل حراري نانو سيراميك دبي | سبيدر سبايدر',
    'Authorized ceramic car window tinting in Dubai. Superior solar heat rejection, UV shielding, and optical clarity.',
    'تظليل سيارات نانو سيراميك في دبي. عزل حراري متفوق وحماية من الشمس ووضوح بصري فائق.'
),
(
    'electrical',
    'electrical',
    'Automotive Electrical Diagnostics & Repair',
    'كهرباء وبرمجة وتشخيص السيارات',
    'Advanced computerized diagnostics, ECU module repairs, wiring troubleshooting, and lighting upgrades.',
    'تشخيص متقدم بالكمبيوتر، صيانة كمبيوترات السيارات والأنظمة الذكية، وإصلاح الضفائر وترقية الإضاءة.',
    'From complex CAN-bus communication faults and battery parasitic draw analysis to electronic steering lock (ESL) and radar sensor calibrations, our diagnostic technicians employ specialized diagnostic computers to identify and resolve electrical issues accurately.',
    'من أعطال شبكات الاتصال المعقدة بالسيارة وتفريغ البطارية إلى صيانة كمبيوترات المحرك وبرمجة الحساسات والردارات، يستخدم فنيونا أجهزة فحص متطورة لحل أدق المشكلات الكهربائية والإلكترونية.',
    'Zap',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    4, true,
    'Car Electrical Repair & Computer Diagnostics Dubai | SpeederSpider',
    'تصليح كهرباء وفحص كمبيوتر سيارات دبي | سبيدر سبايدر',
    'Comprehensive automotive electrical diagnostics, sensor repairs, ECU troubleshooting, and wiring restoration in Dubai.',
    'تشخيص أعطال كهرباء السيارات، برمجة الكمبيوتر، وصيانة الأنظمة الإلكترونية في دبي.'
),
(
    'mechanical',
    'mechanical',
    'Mechanical Maintenance & Engine Overhauls',
    'الصيانة الميكانيكية وتوضيب المحركات',
    'Precision powertrain servicing, transmission diagnostics, brake overhauls, and suspension tuning.',
    'صيانة دقيقة لمنظومة الدفع والمحركات، فحص نواقل الحركة، تجديد أنظمة المكابح وتعديل المساعدات.',
    'Our mechanical workshop provides complete automotive care ranging from scheduled routine maintenance and fluid flushes to complete engine rebuilds, transmission overhauls, cooling system upgrades, and active suspension replacements.',
    'توفر ورشتنا الميكانيكية رعاية متكاملة تشمل الصيانة الدورية وتغيير الزيوت إلى توضيب المحركات والجيربوكس وصيانة دورة التبريد وأنظمة التعليق الهوائي والفرامل بجودة فائقة.',
    'Cpu',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
    5, true,
    'Car Mechanical Repair & Engine Servicing Dubai | SpeederSpider',
    'صيانة ميكانيكية وتوضيب محركات دبي | سبيدر سبايدr',
    'Expert mechanical repairs, engine maintenance, transmission service, and suspension overhauls in Dubai.',
    'خدمات صيانة ميكانيكية متخصصة، تصليح محركات، جيربوكس، وأنظمة تعليق وفرامل في دبي.'
),
(
    'multimedia',
    'multimedia',
    'Multimedia & Sound Systems',
    'أنظمة الصوت والشاشات الذكية',
    'Apple CarPlay, Android Auto integration, DSP acoustic tuning, 360-degree camera systems, and ambient lighting.',
    'تركيب شاشات آبل كاربلاي وأندرويد أوتو، ضبط ومعايرة الصوت الرقمي، كاميرات 360 درجة، وإضاءة محيطية.',
    'Upgrade your in-cabin tech with custom-fitted multimedia receivers, wireless Apple CarPlay, OEM-integrated dash cams, high-fidelity sound systems with active digital sound processors (DSP), and dynamic ambient lighting kits.',
    'قم بترقية تقنيات سيارتك مع شاشات متكاملة تدعم آبل كاربلاي وأندرويد أوتو، كاميرات محيطية 360 درجة، أنظمة صوت نقية ومعالجات صوت رقمية، وإضاءة محيطية داخلية أنيقة.',
    'Radio',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    6, true,
    'Car Multimedia & Apple CarPlay Installation Dubai | SpeederSpider',
    'تركيب شاشات صوت وكاربلاي للسيارات دبي | سبيدر سبايدر',
    'Premium car multimedia installations, Android Auto, Apple CarPlay retrofits, sound tuning, and dashcams in Dubai.',
    'أحدث شاشات السيارات، ترقية أنظمة الصوت، كاميرات داش كام وإضاءة داخلية في دبي.'
),
(
    'denting-painting',
    'denting-painting',
    'Denting, Spray Painting & Bodywork',
    'السمكرة والدهان وإصلاح الصدمات',
    'Paintless dent repair (PDR), computerized color matching, dust-free baking booth refinishing, and chassis alignment.',
    'تعديل الصدمات بدون بوية، مطابقة ألوان إلكترونية دقيقة بالكمبيوتر، ورش دهان في أفران حرارية خالية من الغبار.',
    'Our body repair and paint workshop features computerized spectrophotometer color matching and specialized paint baking booths. Whether repairing minor door dings via PDR or executing a complete vehicle color change, our finishes meet luxury automotive standards.',
    'تتميز ورشة السمكرة والدهان بجهاز مطابقة الألوان الإلكتروني الدقيق وفرن الرش الحراري الإيطالي، لضمان استعادة مظهر السيارة الأصلي سواء عبر تعديل الصدمات بدون دهان أو الطلاء الشامل بجودة المصنع.',
    'Wrench',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    7, true,
    'Car Dent Repair & Spray Painting Dubai | SpeederSpider',
    'سمكرة ودهان سيارات وتعديل صدمات دبي | سبيدر سبايدر',
    'High-end automotive body repair, paintless dent removal, computer color matching, and paint booth finishing in Dubai.',
    'خدمات سمكرة ودهان سيارات احترافية، تعديل صدمات بدون بوية، وأفران دهان حرارية في دبي.'
)
ON CONFLICT (slug_en) DO NOTHING;

-- -----------------------------------------------------------------------------
-- SEED DATA: Inventory Categories
-- -----------------------------------------------------------------------------
INSERT INTO public.inventory_categories (name_en, name_ar, slug, description) VALUES
('Leather & Fabric', 'الجلود والأقمشة', 'leather-fabric', 'Automotive hides, Nappa leather, Alcantara, thread spools, and adhesives.'),
('Detailing & Coatings', 'مواد التلميع والنانو', 'detailing-coatings', 'Ceramic coatings, cutting compounds, polishing pads, microfibers, and sealants.'),
('Window Films', 'أفلام التظليل والعزل', 'window-films', 'Ceramic tint rolls, heat rejection films, squeegees, and mounting solutions.'),
('Electrical & Diagnostics', 'قطع الكهرباء والكمبيوتر', 'electrical-diagnostics', 'Relays, fuses, wiring looms, sensors, LED bulbs, and connectors.'),
('Mechanical Fluids & Parts', 'زيوت وقطع ميكانيكية', 'mechanical-fluids-parts', 'Synthetic motor oils, brake pads, filters, spark plugs, and coolants.'),
('Multimedia & Audio', 'أنظمة الصوت والشاشات', 'multimedia-audio', 'Harness adapters, head units, speakers, amplifiers, and reversing cameras.'),
('Paints & Bodywork', 'دهانات ومواد السمكرة', 'paints-bodywork', 'Primers, basecoats, clearcoats, body fillers, abrasives, and masking tape.')
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- ENHANCEMENTS & SCHEMA EXTENSIONS
-- =============================================================================

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


-- =============================================================================
-- SEED DATA: Portfolio Projects (With Before & After Imagery)
-- =============================================================================

INSERT INTO public.portfolio_projects (
    slug, service_id, title_en, title_ar,
    short_desc_en, short_desc_ar,
    desc_en, desc_ar,
    vehicle_make, vehicle_model, vehicle_year,
    before_image, after_image,
    gallery_images, is_featured, is_published, display_order,
    seo_title_en, seo_title_ar, seo_desc_en, seo_desc_ar
)
SELECT 
    'porsche-gt3-paint-correction',
    s.id,
    'Porsche 911 GT3 Paint Correction & Ceramic Shield',
    'بورشه 911 GT3 تصحيح طلاء وحماية نانو سيراميك',
    'Multi-stage compound polishing removing severe swirl marks and oxidation, sealed with dual-layer 9H ceramic coating.',
    'تلميع وتصحيح طلاء متعدد المراحل لإزالة آثار الدوائر والبهتان بالكامل، متبوعاً بطبقتين من النانو سيراميك 9H.',
    'A comprehensive paint correction protocol performed on an Agate Grey Porsche 911 GT3. The clearcoat exhibited severe micro-swirls and localized marring from improper washing techniques. Our detailing specialists executed an extensive 3-stage rotary and dual-action compound polish, leveling clearcoat imperfections to 95%+ optical clarity. Surfaces were then treated with dual coats of professional-grade 9H hydrophobic ceramic coating, providing robust protection against UAE desert atmospheric conditions.',
    'مشروع متكامل لتصحيح الطلاء لسيارة بورشه 911 GT3 باللون الرمادي، حيث عانت طبقة اللمعان الشفافة من دوائر وخدوش دقيقة ناتجة عن الغسيل الخاطئ. نفّذ فريق التلميع عملية تصحيح ثلاثية المراحل باستخدام أحدث مركبات التلميع الإيطالية لاستعادة النقاء البصري بنسبة 95%+، ثم تم تطبيق طبقتين من النانو سيراميك 9H المقاوم للحرارة ورمل دبي لتوفير لمعان وحماية كارهة للماء تدوم طويلاً.',
    'Porsche', '911 GT3', '2023',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80']::text[],
    true, true, 1,
    'Porsche 911 GT3 Ceramic Coating & Detailing Dubai | SpeederSpider',
    'تلميع وسيراميك بورشه 911 GT3 دبي | سبيدر سبايدر',
    'Before and after paint correction and ceramic coating for Porsche 911 GT3 in Dubai.',
    'صور قبل وبعد تصحيح الطلاء وحماية النانو سيراميك لبورشه 911 GT3 في دبي.'
FROM public.services s WHERE s.slug_en = 'detailing-polishing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.portfolio_projects (
    slug, service_id, title_en, title_ar,
    short_desc_en, short_desc_ar,
    desc_en, desc_ar,
    vehicle_make, vehicle_model, vehicle_year,
    before_image, after_image,
    gallery_images, is_featured, is_published, display_order,
    seo_title_en, seo_title_ar, seo_desc_en, seo_desc_ar
)
SELECT 
    'mercedes-g63-bespoke-upholstery',
    s.id,
    'Mercedes-AMG G63 Bespoke Interior Re-trim',
    'مرسيدس AMG G63 تنجيد داخلي مخصص بجلد النابا',
    'Complete interior overhaul featuring saddle-tan Nappa leather, diamond quilted door inserts, and black Alcantara headliner.',
    'تجديد وتعديل كامل لمقصورة السيارة باستخدام جلد نابا طبيعي باللون الجملي، وتطريز ماسي للأبواب وسقف الكانتارا أسود فاخر.',
    'A bespoke full-cabin interior re-trim for a Mercedes-AMG G63. Factory black upholstery was completely deconstructed and renewed with premium full-grain Italian Nappa leather in Saddle Tan. Custom diamond-quilted seat centers and door cards were precisely stitched on computerized machines. The project was completed with a jet-black Alcantara headliner, color-matched A/B/C pillars, and customized embossed headrests.',
    'مشروع إعادة تصميم وتنجيد شامل لمقصورة مرسيدس AMG G63. تم استبدال فرش الوكالة الأسود بالكامل بجلد نابا إيطالي طبيعي فاخر باللون الجملي الدافئ، مع خياطة ماسية دقيقة لمنتصف المقاعد وبطانات الأبواب. شمل المشروع تبطين سقف السيارة بالكانتارا سوداء ناعمة مع الأعمدة الجانبية، وتطريز شعارات مخصصة على مساند الرأس بأعلى معايير الإتقان.',
    'Mercedes-AMG', 'G63', '2022',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80']::text[],
    true, true, 2,
    'Mercedes-AMG G63 Bespoke Leather Upholstery Dubai | SpeederSpider',
    'تنجيد مرسيدس G63 جلد نابا فاخر دبي | سبيدر سبايدر',
    'Custom Italian Nappa leather interior transformation for Mercedes-AMG G63 in Dubai.',
    'تجديد وتنجيد داخلي مخصص بجلد نابا إيطالي لمرسيدس G63 في دبي.'
FROM public.services s WHERE s.slug_en = 'upholstery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.portfolio_projects (
    slug, service_id, title_en, title_ar,
    short_desc_en, short_desc_ar,
    desc_en, desc_ar,
    vehicle_make, vehicle_model, vehicle_year,
    before_image, after_image,
    gallery_images, is_featured, is_published, display_order,
    seo_title_en, seo_title_ar, seo_desc_en, seo_desc_ar
)
SELECT 
    'nissan-patrol-multimedia-upgrade',
    s.id,
    'Nissan Patrol Y62 Multimedia & 360 HD Camera',
    'نيسان باترول بطل الدروب ترقية شاشة ذكية وكاميرات 360',
    'Installation of wide-angle HD multimedia display with wireless Apple CarPlay and integrated calibrated 360 surround-view cameras.',
    'تركيب شاشة ذكية عريضة عالية الدقة تدعم آبل كاربلاي اللاسلكي مع نظام كاميرات محيطية 360 درجة ومعايرة زوايا الرؤية.',
    'Technology retrofit for a Nissan Patrol Y62. We integrated an OEM-look 12.3-inch high-resolution capacitive touch receiver supporting wireless Apple CarPlay and Android Auto. In addition, 4 calibrated wide-angle cameras were discreetly mounted in the front grille, side mirrors, and tailgate, generating a real-time 3D bird''s-eye surround view with dynamic trajectory guidelines.',
    'ترقية تقنية شاملة لسيارة نيسان باترول Y62. تم تركيب شاشة عريضة مقاس 12.3 بوصة عالية الدقة تدعم آبل كاربلاي وأندرويد أوتو اللاسلكي مع الحفاظ على تحكم المقود الأصلي. بالإضافة إلى ذلك، تم تركيب وتوزيع 4 كاميرات فائقة الوضوح في الشبك الأمامي والمرايا والشنطة لتوفير رؤية محيطية 360 درجة ثلاثية الأبعاد مع خطوط توجيه متحركة.',
    'Nissan', 'Patrol Y62', '2021',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80']::text[],
    true, true, 3,
    'Nissan Patrol Y62 Multimedia & CarPlay Upgrade Dubai | SpeederSpider',
    'ترقية شاشة وكاميرات نيسان باترول دبي | سبيدر سبايدر',
    'Wireless Apple CarPlay and 360 surround camera installation for Nissan Patrol Y62 in Dubai.',
    'تركيب شاشة وكاميرات محيطية 360 درجة لنيسان باترول في دبي.'
FROM public.services s WHERE s.slug_en = 'multimedia'
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- SEED DATA: Authentic Client Testimonials
-- =============================================================================

INSERT INTO public.testimonials (
    client_name_en, client_name_ar, vehicle_info, rating,
    review_en, review_ar, is_published, display_order
) VALUES
(
    'Khalid Al-Marri', 'خالد المري', 'Mercedes-AMG G63', 5,
    'The leather upholstery work completed on my G63 was flawless. The stitching precision and leather quality exceeded expectations. A truly dedicated workshop in Dubai.',
    'شغل التنجيد في الجي 63 كان قمة في الروعة والإتقان. دقة الخياطة ونوعية جلد النابا فاخرة جداً. ورشة احترافية بكل المقاييس في دبي.',
    true, 1
),
(
    'David Robertson', 'ديفيد روبرتسون', 'Porsche 911 Turbo S', 5,
    'Brought my Turbo S for full nanoceramic window tinting and paint correction. The heat reduction during Dubai midday is noticeable, and the paint looks deeper than showroom new.',
    'قمت بتركيب عازل حراري نانو سيراميك وتصحيح طلاء لسيارتي البورشه. العزل الحراري في حرارة الصيف رائع واللمعان أفضل من وكالتها.',
    true, 2
),
(
    'Sultan Al-Nuaimi', 'سلطان النعيمي', 'Nissan Patrol V8', 5,
    'Fast diagnostic resolution of an electrical issue that two other garages failed to diagnose. Honest technicians and clear communication throughout.',
    'حل سريع وتشخيص دقيق لمشكلة كهربائية عجزت عنها كراجات أخرى. أمانة وشفافية واضحة في التعامل وتحديث مستمر لحالة السيارة.',
    true, 3
)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- PERMISSIONS & ROLES ACCESS GRANTS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Link owner profile if user already created in auth.users
INSERT INTO public.profiles (id, role, full_name, email, is_active)
SELECT 
    id, 
    'owner', 
    'SpeederSpider Owner', 
    email, 
    true
FROM auth.users 
WHERE email = 'owner@speederspider.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'owner', is_active = true;

-- -----------------------------------------------------------------------------
-- 9. Products Table & Initial Catalog
-- -----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_products_published_order ON public.products(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_products_slug_en ON public.products(slug_en);
CREATE INDEX IF NOT EXISTS idx_products_slug_ar ON public.products(slug_ar);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (is_published = true);
CREATE POLICY "Staff and above can view all products" ON public.products FOR SELECT TO authenticated USING (public.is_staff_or_above());
CREATE POLICY "Managers and owners can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can update products" ON public.products FOR UPDATE TO authenticated USING (public.is_manager_or_above()) WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can delete products" ON public.products FOR DELETE TO authenticated USING (public.is_manager_or_above());

GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

INSERT INTO public.products (
    id, slug_en, slug_ar, name_en, name_ar, brand_en, brand_ar, price_en, price_ar, description_en, description_ar, image_url, category, display_order, is_published, is_featured
) VALUES
('prod-1-car-play-box', 'car-play-box', 'car-play-box', 'Car Play Box', 'صندوق تشغيل السيارة', 'Not specified', 'غير محدد', 'Price on Request', 'السعر عند الطلب', 'A compact multimedia device that enables smartphone connectivity and smart entertainment features in your car.', 'جهاز وسائط متعددة صغير يتيح الاتصال بالهاتف الذكي والاستمتاع بميزات الترفيه الذكية داخل السيارة.', 'https://lh3.googleusercontent.com/d/1w8rjoSwwScFK3IZ6Wb74MohxBJnZLdg7', 'Multimedia', 1, true, true),
('prod-2-tracking-system', 'tracking-system-gsm', 'tracking-system-gsm', 'Tracking System with GSM Card', 'نظام تتبع مع بطاقة GSM', 'Not specified', 'غير محدد', 'Price on Request', 'السعر عند الطلب', 'A vehicle tracking device that uses GSM connectivity to support vehicle location monitoring and tracking.', 'جهاز لتتبع المركبات يستخدم تقنية GSM لدعم مراقبة موقع السيارة وتتبعها.', 'https://lh3.googleusercontent.com/d/1RE0j6QPA3-3NMhTJBX2XwH2lJAOQCBky', 'Security & Tracking', 2, true, true),
('prod-3-3m-window-film', '3m-window-film', '3m-window-film', '3M Window Film', 'أفلام تظليل النوافذ من 3M', '3M', '3M', 'Price on Request', 'السعر عند الطلب', 'Premium automotive window film designed to reduce heat and glare while providing UV protection and enhanced privacy.', 'أفلام نوافذ عالية الجودة للسيارات مصممة لتقليل الحرارة والوهج مع توفير الحماية من الأشعة فوق البنفسجية وتعزيز الخصوصية.', 'https://lh3.googleusercontent.com/d/1n0ONzEh_y_LRDLnLA7pw3BurWDrK9sMo', 'Window Tinting', 3, true, true),
('prod-4-led-light', 'led-light', 'led-light', 'LED Light', 'مصابيح LED للسيارات', 'Not specified', 'غير محدد', 'Price on Request', 'السعر عند الطلب', 'Automotive LED lighting designed to provide bright illumination and improved visibility while driving.', 'مصابيح LED للسيارات توفر إضاءة قوية ورؤية محسّنة أثناء القيادة.', 'https://lh3.googleusercontent.com/d/1R6U_7PLld0azS4mHXY8WHF4FX3yICXs5', 'Lighting', 4, true, false),
('prod-5-car-fridge', 'car-fridge', 'car-fridge', 'Car Fridge', 'ثلاجة السيارة', 'Not specified', 'غير محدد', 'Price on Request', 'السعر عند الطلب', 'A portable refrigerator designed to keep beverages and food cool during road trips and long journeys.', 'ثلاجة محمولة مصممة للحفاظ على برودة المشروبات والأطعمة أثناء الرحلات والسفر لمسافات طويلة.', 'https://lh3.googleusercontent.com/d/1_JrAFyI2oaw28QZvpt_zPqAEJ3hcmsD8', 'Accessories', 5, true, true),
('prod-6-gmc-dvd-player', 'gmc-android-dvd-player-system', 'gmc-android-dvd-player-system', 'GMC Android DVD Player System', 'نظام مشغل DVD أندرويد لسيارات GMC', 'GMC', 'جي إم سي', 'Price on Request', 'السعر عند الطلب', 'An Android-based multimedia entertainment system designed for compatible GMC vehicle dashboards.', 'نظام ترفيه ووسائط متعددة يعمل بنظام أندرويد ومصمم ليتناسب مع لوحات القيادة في سيارات GMC المتوافقة.', 'https://lh3.googleusercontent.com/d/1hyyZUiIr57ppBQ7AtVpAL6Ukq24NGrwF', 'Multimedia', 6, true, false),
('prod-7-ford-dvd-player', 'ford-android-dvd-player-system', 'ford-android-dvd-player-system', 'Ford Android DVD Player System', 'نظام مشغل DVD أندرويد لسيارات فورد', 'Ford', 'فورد', 'Price on Request', 'السعر عند الطلب', 'An Android multimedia entertainment system designed for compatible Ford vehicle dashboards.', 'نظام ترفيه ووسائط متعددة يعمل بنظام أندرويد ومصمم ليتناسب مع لوحات القيادة في سيارات فورد المتوافقة.', 'https://lh3.googleusercontent.com/d/15oCVQhF-EZ4-XMKZf0jRUmOfar6PWr6g', 'Multimedia', 7, true, false),
('prod-8-nissan-dvd-player', 'nissan-android-dvd-player-system', 'nissan-android-dvd-player-system', 'Nissan Android DVD Player System', 'نظام مشغل DVD أندرويد لسيارات نيسان', 'Nissan', 'نيسان', 'Price on Request', 'السعر عند الطلب', 'An Android multimedia entertainment system designed for compatible Nissan vehicle dashboards.', 'نظام ترفيه ووسائط متعددة يعمل بنظام أندرويد ومصمم ليتناسب مع لوحات القيادة في سيارات نيسان المتوافقة.', 'https://lh3.googleusercontent.com/d/1f9RHXMxJX_WsOtvUt4T7xVxvIOd9DAUM', 'Multimedia', 8, true, false)
ON CONFLICT (id) DO UPDATE SET
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

-- -----------------------------------------------------------------------------
-- 10. Unified Categories Table & Catalog
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name_en ON public.categories(name_en);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Managers and owners can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can update categories" ON public.categories FOR UPDATE TO authenticated USING (public.is_manager_or_above()) WITH CHECK (public.is_manager_or_above());
CREATE POLICY "Managers and owners can delete categories" ON public.categories FOR DELETE TO authenticated USING (public.is_manager_or_above());

GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

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

INSERT INTO public.categories (name_en, name_ar, slug, description)
VALUES
('Multimedia & Audio', 'أنظمة الصوت والشاشات', 'multimedia-audio', 'CarPlay boxes, Android DVD dashboard systems, multimedia adapters, and audio upgrades.'),
('Window Films', 'أفلام التظليل والعزل', 'window-films', '3M and nanoceramic automotive window tinting, heat rejection films, and tools.'),
('Security & Tracking', 'أنظمة التتبع والأمان', 'security-tracking', 'GSM vehicle GPS trackers, remote monitoring modules, and security sensors.'),
('Automotive Lighting', 'إضاءة ومصابيح السيارات', 'automotive-lighting', 'High-intensity LED projector bulbs, fog lights, and ambient cabin illumination.'),
('Accessories & Upgrades', 'إكسسوارات وترقيات السيارات', 'accessories-upgrades', 'Portable car fridges, cabin organizers, wireless chargers, and custom vehicle gadgets.'),
('Leather & Fabric', 'الجلود والأقمشة', 'leather-fabric', 'Automotive hides, Nappa leather, Alcantara, thread spools, and adhesives.'),
('Detailing & Coatings', 'مواد التلميع والنانو', 'detailing-coatings', 'Ceramic coatings, cutting compounds, polishing pads, microfibers, and sealants.'),
('Electrical Spares', 'قطع الكهرباء والحساسات', 'electrical-spares', 'Relays, fuses, wiring looms, sensors, and electronic control connectors.'),
('Fluids & Filters', 'الزيوت والفلاتر', 'fluids-filters', 'Synthetic motor oils, brake pads, filters, spark plugs, and coolants.'),
('Paints & Bodywork', 'دهانات ومواد السمكرة', 'paints-bodywork', 'Primers, basecoats, clearcoats, body fillers, abrasives, and masking tape.')
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

-- Re-link inventory_items foreign key to public.categories
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'inventory_items'
    ) THEN
        ALTER TABLE public.inventory_items 
            DROP CONSTRAINT IF EXISTS inventory_items_category_id_fkey;

        ALTER TABLE public.inventory_items 
            ADD CONSTRAINT inventory_items_category_id_fkey 
            FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Link products table to public.categories via category_id
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'products'
    ) THEN
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category_id'
        ) THEN
            ALTER TABLE public.products 
                ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
            
            CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
        END IF;

        UPDATE public.products p
        SET category_id = c.id
        FROM public.categories c
        WHERE p.category_id IS NULL AND (
            LOWER(p.category) = LOWER(c.name_en)
            OR LOWER(p.category) = LOWER(c.slug)
            OR (p.category ILIKE '%Multimedia%' AND c.slug = 'multimedia-audio')
            OR (p.category ILIKE '%Window%' AND c.slug = 'window-films')
            OR (p.category ILIKE '%Tracking%' AND c.slug = 'security-tracking')
            OR (p.category ILIKE '%Light%' AND c.slug = 'automotive-lighting')
            OR (p.category ILIKE '%Accessories%' AND c.slug = 'accessories-upgrades')
        );
    END IF;
END $$;



