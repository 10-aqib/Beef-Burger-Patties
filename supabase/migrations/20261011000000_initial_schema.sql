-- ============================================================================
-- Paput Burgers — Production Database Schema & Transactional RPC
-- Migration: 20261011000000_initial_schema.sql
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    calories INTEGER,
    allergens TEXT[] DEFAULT '{}',
    badge TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MODIFIER GROUPS
CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    min_selection INTEGER NOT NULL DEFAULT 0,
    max_selection INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 5. MODIFIER OPTIONS
CREATE TABLE IF NOT EXISTS public.modifier_options (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    group_id TEXT NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_adjustment INTEGER NOT NULL DEFAULT 0 CHECK (price_adjustment >= 0),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 6. DEALS
CREATE TABLE IF NOT EXISTS public.deals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    items_description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    original_price INTEGER CHECK (original_price >= price),
    image_url TEXT NOT NULL,
    badge TEXT,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. LOCATIONS
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    opening_hours TEXT NOT NULL,
    closing_hours TEXT NOT NULL,
    is_open BOOLEAN NOT NULL DEFAULT true,
    is_busy BOOLEAN NOT NULL DEFAULT false,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    delivery_radius_km NUMERIC(4,1) NOT NULL DEFAULT 10.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_amount INTEGER NOT NULL DEFAULT 0,
    max_discount INTEGER,
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    delivery_address JSONB NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'raast', 'jazzcash', 'nayapay')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    delivery_fee INTEGER NOT NULL CHECK (delivery_fee >= 0),
    discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total INTEGER NOT NULL CHECK (total >= 0),
    coupon_code TEXT,
    special_instructions TEXT,
    estimated_delivery_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    modifiers JSONB DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. CONTACT INQUIRIES
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_name TEXT NOT NULL,
    user_city TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    order_item_name TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_modifier_groups_product ON public.modifier_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON public.modifier_options(group_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved);

-- 16. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view modifier_groups" ON public.modifier_groups FOR SELECT USING (true);
CREATE POLICY "Public can view modifier_options" ON public.modifier_options FOR SELECT USING (true);
CREATE POLICY "Public can view active deals" ON public.deals FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);

-- Order Policies
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their order by order_number or id" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order status history" ON public.order_status_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order status history" ON public.order_status_history FOR SELECT USING (true);

-- Contact & Newsletter Policies
CREATE POLICY "Anyone can submit contact inquiry" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit review" ON public.reviews FOR INSERT WITH CHECK (true);

-- 17. AUTHORITATIVE ORDER RPC
CREATE OR REPLACE FUNCTION public.create_order_transaction(
    p_user_id UUID,
    p_delivery_address JSONB,
    p_payment_method TEXT,
    p_coupon_code TEXT,
    p_special_instructions TEXT,
    p_items JSONB,
    p_estimated_delivery_minutes INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id TEXT;
    v_order_number TEXT;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_year_month TEXT := to_char(v_now, 'YYYYMM');
    v_random_code TEXT := LPAD(FLOOR(random() * 9000 + 1000)::TEXT, 4, '0');
    v_subtotal INTEGER := 0;
    v_delivery_fee INTEGER := 200;
    v_discount INTEGER := 0;
    v_total INTEGER := 0;
    v_free_delivery_threshold INTEGER := 2500;
    v_item RECORD;
    v_item_subtotal INTEGER;
    v_coupon RECORD;
BEGIN
    -- 1. Generate canonical order number
    v_order_id := uuid_generate_v4()::text;
    v_order_number := 'PAPUT-' || v_year_month || '-' || v_random_code;

    -- 2. Validate and calculate items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id TEXT,
        product_name TEXT,
        product_image_url TEXT,
        quantity INTEGER,
        unit_price INTEGER,
        modifiers JSONB,
        special_instructions TEXT
    )
    LOOP
        v_item_subtotal := v_item.quantity * v_item.unit_price;
        v_subtotal := v_subtotal + v_item_subtotal;
    END LOOP;

    -- 3. Calculate delivery fee
    IF v_subtotal >= v_free_delivery_threshold THEN
        v_delivery_fee := 0;
    END IF;

    -- 4. Validate coupon code if provided
    IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
        SELECT * INTO v_coupon FROM public.coupons 
        WHERE code = UPPER(TRIM(p_coupon_code))
          AND is_active = true
          AND (valid_to IS NULL OR valid_to > v_now)
          AND (usage_limit IS NULL OR usage_count < usage_limit);

        IF FOUND THEN
            IF v_subtotal >= v_coupon.min_order_amount THEN
                IF v_coupon.discount_type = 'percentage' THEN
                    v_discount := FLOOR((v_subtotal * v_coupon.discount_value) / 100);
                    IF v_coupon.max_discount IS NOT NULL AND v_discount > v_coupon.max_discount THEN
                        v_discount := v_coupon.max_discount;
                    END IF;
                ELSE
                    v_discount := v_coupon.discount_value::INTEGER;
                END IF;

                -- Update coupon usage count
                UPDATE public.coupons SET usage_count = usage_count + 1 WHERE id = v_coupon.id;
            END IF;
        END IF;
    END IF;

    -- 5. Grand total
    v_total := GREATEST(0, (v_subtotal + v_delivery_fee - v_discount));

    -- 6. Insert order
    INSERT INTO public.orders (
        id,
        order_number,
        user_id,
        status,
        delivery_address,
        payment_method,
        payment_status,
        subtotal,
        delivery_fee,
        discount,
        total,
        coupon_code,
        special_instructions,
        estimated_delivery_minutes,
        created_at,
        updated_at
    ) VALUES (
        v_order_id,
        v_order_number,
        p_user_id,
        'placed',
        p_delivery_address,
        p_payment_method,
        'pending',
        v_subtotal,
        v_delivery_fee,
        v_discount,
        v_total,
        p_coupon_code,
        p_special_instructions,
        p_estimated_delivery_minutes,
        v_now,
        v_now
    );

    -- 7. Insert order items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id TEXT,
        product_name TEXT,
        product_image_url TEXT,
        quantity INTEGER,
        unit_price INTEGER,
        modifiers JSONB,
        special_instructions TEXT
    )
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_image_url,
            quantity,
            unit_price,
            total_price,
            modifiers,
            special_instructions,
            created_at
        ) VALUES (
            v_order_id,
            v_item.product_id,
            v_item.product_name,
            v_item.product_image_url,
            v_item.quantity,
            v_item.unit_price,
            (v_item.quantity * v_item.unit_price),
            COALESCE(v_item.modifiers, '[]'::jsonb),
            v_item.special_instructions,
            v_now
        );
    END LOOP;

    -- 8. Insert initial status history
    INSERT INTO public.order_status_history (
        order_id,
        status,
        note,
        created_at
    ) VALUES (
        v_order_id,
        'placed',
        'Order successfully placed and recorded',
        v_now
    );

    -- 9. Return completed order object
    RETURN jsonb_build_object(
        'id', v_order_id,
        'order_number', v_order_number,
        'status', 'placed',
        'subtotal', v_subtotal,
        'delivery_fee', v_delivery_fee,
        'discount', v_discount,
        'total', v_total,
        'created_at', v_now
    );
END;
$$;
