-- =============================================================================
-- SpeederSpider Automotive Platform - Payments & Cash Flow Schema Migration
-- Migration Timestamp: 2026-11-25T00:00:00Z
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_type VARCHAR(30) NOT NULL CHECK (
        transaction_type IN ('INCOME', 'EXPENSE', 'OWNER_WITHDRAWAL', 'OWNER_CONTRIBUTION')
    ),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH' CHECK (
        payment_method IN ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER')
    ),
    reference_number VARCHAR(100),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(transaction_type);
CREATE INDEX IF NOT EXISTS idx_payments_category ON public.payments(category);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 1. Managers and Owners can view all financial payment records
CREATE POLICY "Managers and owners can view payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING (public.is_manager_or_above());

-- 2. Managers and Owners can insert payments
CREATE POLICY "Managers and owners can insert payments"
    ON public.payments
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_manager_or_above());

-- 3. Managers and Owners can update payments
CREATE POLICY "Managers and owners can update payments"
    ON public.payments
    FOR UPDATE
    TO authenticated
    USING (public.is_manager_or_above())
    WITH CHECK (public.is_manager_or_above());

-- 4. Owners can delete payments (strict financial audit integrity)
CREATE POLICY "Owners can delete payments"
    ON public.payments
    FOR DELETE
    TO authenticated
    USING (public.is_owner());

-- Grant privileges
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
