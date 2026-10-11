-- ============================================================================
-- Paput Burgers — Production Seed Data
-- Migration: 20261011000001_seed_data.sql
-- ============================================================================

-- 1. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, sort_order)
VALUES
  ('cat-burgers', 'Smash Burgers', 'smash-burgers', 'Our signature dual-pressed smash burgers', 1),
  ('cat-chicken', 'Crispy Chicken', 'crispy-chicken', 'Nashville-style fried chicken sandwiches', 2),
  ('cat-fries', 'Loaded Fries', 'loaded-fries', 'Crinkle-cut fries with premium toppings', 3),
  ('cat-drinks', 'Drinks', 'drinks', 'Craft sodas and shakes', 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- 2. PRODUCTS
INSERT INTO public.products (id, category_id, name, slug, description, price, image_url, is_available, is_featured, badge, sort_order)
VALUES
  ('prod-og-double', 'cat-burgers', 'PAPUT OG DOUBLE', 'paput-og-double', 'Dual lace-edged Angus beef patties, molten aged cheddar, grilled caramelized onion jam, signature smash dip, butter-griddled potato brioche.', 849, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', true, true, 'BESTSELLER', 1),
  ('prod-triple-smash', 'cat-burgers', 'TRIPLE SMASH TOWER', 'triple-smash-tower', 'Three crispy lace Angus patties, triple molten American cheese, house dill pickles, smoky bacon mayo, toasted brioche.', 1099, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80', true, true, 'HOT', 2),
  ('prod-truffle-melt', 'cat-burgers', 'TRUFFLE SMASH MELT', 'truffle-smash-melt', 'Dual smashed Angus patties, sautéed garlic butter mushrooms, white cheddar, black truffle aioli on brioche.', 999, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&q=80', true, true, 'CHEF PICK', 3),
  ('prod-hot-nashville', 'cat-chicken', 'HOT NASHVILLE CRISP', 'hot-nashville-crisp', '24-hour buttermilk soaked chicken thigh, dipped in habanero chilli oil, cool creamy slaw, house pickles.', 799, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&q=80', true, true, 'SPICY', 4),
  ('prod-truffle-parm-fries', 'cat-fries', 'TRUFFLE PARM CRINKLE', 'truffle-parm-crinkle', 'Crinkle-cut Idaho potatoes tossed in white truffle oil, grated 24-month Parmigiano-Reggiano, fresh parsley.', 449, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&q=80', true, false, 'POPULAR', 5),
  ('prod-smasher-shake', 'cat-drinks', 'PAPUT SMASHER SHAKE', 'paput-smasher-shake', 'Hand-spun Madagascar vanilla bean custard with salted caramel drizzle and crushed speculoos cookies.', 499, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80', true, false, 'FAVORITE', 6)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available,
  is_featured = EXCLUDED.is_featured,
  badge = EXCLUDED.badge,
  sort_order = EXCLUDED.sort_order;

-- 3. MODIFIER GROUPS & OPTIONS
INSERT INTO public.modifier_groups (id, product_id, name, description, min_selection, max_selection, is_required, sort_order)
VALUES
  ('mod-group-og-extras', 'prod-og-double', 'Extra Add-ons', 'Customize your burger', 0, 5, false, 1),
  ('mod-group-shake-flavor', 'prod-smasher-shake', 'Choice of Flavor', 'Select your base custard flavor', 1, 1, true, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  min_selection = EXCLUDED.min_selection,
  max_selection = EXCLUDED.max_selection,
  is_required = EXCLUDED.is_required,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.modifier_options (id, group_id, name, price_adjustment, is_default, is_available, sort_order)
VALUES
  ('opt-extra-patty', 'mod-group-og-extras', 'Extra Smash Patty', 280, false, true, 1),
  ('opt-extra-cheddar', 'mod-group-og-extras', 'Extra Aged Cheddar', 120, false, true, 2),
  ('opt-beef-bacon', 'mod-group-og-extras', 'Crispy Beef Bacon Strips', 180, false, true, 3),
  ('opt-jalapenos', 'mod-group-og-extras', 'Grilled Pickled Jalapeños', 80, false, true, 4),
  ('opt-shake-vanilla', 'mod-group-shake-flavor', 'Madagascar Vanilla Custard', 0, true, true, 1),
  ('opt-shake-chocolate', 'mod-group-shake-flavor', 'Belgian Dark Chocolate', 50, false, true, 2),
  ('opt-shake-caramel', 'mod-group-shake-flavor', 'Salted Butter Caramel', 50, false, true, 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_adjustment = EXCLUDED.price_adjustment,
  is_default = EXCLUDED.is_default,
  is_available = EXCLUDED.is_available,
  sort_order = EXCLUDED.sort_order;

-- 4. DEALS
INSERT INTO public.deals (id, name, slug, description, items_description, price, original_price, image_url, badge, is_active)
VALUES
  ('deal-duo-crush', 'DUO CRUSH COMBO', 'duo-crush-combo', '2x Paput OG Doubles + 1x Truffle Parm Fries + 2x Craft Sodas', '2 Burgers, 1 Fries, 2 Drinks', 1899, 2397, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80', 'SAVE 20%', true),
  ('deal-gang-squad', 'GANG SQUAD FEAST', 'gang-squad-feast', '4x Signature Smash Burgers + 2x Loaded Fries + 4x Sodas', '4 Burgers, 2 Loaded Fries, 4 Drinks', 3599, 4600, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80', 'FAMILY PACK', true),
  ('deal-solo-rush', 'SOLO RUSH BOX', 'solo-rush-box', '1x Paput OG Double + 1x Small Fries + 1x Cold Drink', '1 Burger, 1 Small Fries, 1 Soda', 1099, 1350, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80', 'POPULAR', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  items_description = EXCLUDED.items_description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge,
  is_active = EXCLUDED.is_active;

-- 5. LOCATIONS
INSERT INTO public.locations (id, name, city, address, phone, opening_hours, closing_hours, is_open, is_busy, lat, lng, delivery_radius_km)
VALUES
  ('loc-isb-f7', 'F-7 Markaz Flagship', 'Islamabad', 'Shop 4, Block C, F-7 Markaz, Islamabad', '+92 51 265 1980', '12:00 PM', '02:00 AM', true, false, 33.7215, 73.0563, 12.0),
  ('loc-isb-f11', 'F-11 Markaz Express', 'Islamabad', 'Main Boulevard, F-11 Markaz, Islamabad', '+92 51 210 4455', '12:00 PM', '02:00 AM', true, false, 33.6844, 72.9886, 10.0),
  ('loc-rwp-saddar', 'Saddar Rawalpindi', 'Rawalpindi', 'Haider Road, Saddar, Rawalpindi', '+92 51 556 7890', '01:00 PM', '01:00 AM', true, false, 33.5973, 73.0479, 10.0),
  ('loc-lhr-gulberg', 'Gulberg III Hub', 'Lahore', 'M.M. Alam Road, Gulberg III, Lahore', '+92 42 357 8899', '12:00 PM', '03:00 AM', true, false, 31.5204, 74.3587, 15.0),
  ('loc-lhr-dha', 'DHA Phase 5', 'Lahore', 'Sector C Commercial, DHA Phase 5, Lahore', '+92 42 371 8220', '12:00 PM', '03:00 AM', true, false, 31.4697, 74.4088, 12.0),
  ('loc-khi-clifton', 'Clifton Block 4', 'Karachi', 'Marine Drive, Block 4, Clifton, Karachi', '+92 21 358 1122', '01:00 PM', '04:00 AM', true, false, 24.8138, 67.0300, 15.0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  opening_hours = EXCLUDED.opening_hours,
  closing_hours = EXCLUDED.closing_hours,
  is_open = EXCLUDED.is_open,
  is_busy = EXCLUDED.is_busy,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  delivery_radius_km = EXCLUDED.delivery_radius_km;

-- 6. COUPONS
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active)
VALUES
  ('coup-welcome', 'PAPUT10', 'percentage', 10.0, 1000, 300, 10000, true),
  ('coup-smash200', 'SMASH200', 'fixed', 200.0, 1500, NULL, 5000, true),
  ('coup-feast500', 'FEAST500', 'fixed', 500.0, 3000, NULL, 1000, true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount = EXCLUDED.max_discount,
  is_active = EXCLUDED.is_active;
