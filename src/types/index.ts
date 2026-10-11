// ============================================================
// Paput Burgers — Core TypeScript Types
// ============================================================

export type UUID = string;

// ─── Auth ───────────────────────────────────────────────────
export interface Profile {
  id: UUID;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

// ─── Categories ──────────────────────────────────────────────
export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ─── Products ────────────────────────────────────────────────
export interface Product {
  id: UUID;
  category_id: UUID;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_spicy: boolean;
  is_bestseller: boolean;
  rating: number;
  rating_count: number;
  badge: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  modifiers?: ModifierGroup[];
}

// ─── Modifiers ────────────────────────────────────────────────
export interface ModifierGroup {
  id: UUID;
  product_id: UUID;
  name: string;
  description: string | null;
  is_required: boolean;
  max_selections: number;
  min_selections: number;
  sort_order: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: UUID;
  group_id: UUID;
  name: string;
  description: string | null;
  price_adjustment: number;
  is_available: boolean;
  sort_order: number;
}

// ─── Cart ─────────────────────────────────────────────────────
export interface CartItem {
  id: string; // Local UUID for cart item
  product: Product;
  quantity: number;
  selected_modifiers: SelectedModifier[];
  unit_price: number; // Base price + modifiers
  total_price: number; // unit_price * quantity
  special_instructions: string;
}

export interface SelectedModifier {
  group_id: UUID;
  group_name: string;
  option_id: UUID;
  option_name: string;
  price_adjustment: number;
}

export interface CartSummary {
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  item_count: number;
}

// ─── Orders ───────────────────────────────────────────────────
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'card' | 'raast' | 'nayapay' | 'jazzcash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface DeliveryAddress {
  full_name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  instructions: string;
}

export interface Order {
  id: UUID;
  order_number: string;
  user_id: UUID | null;
  status: OrderStatus;
  items: OrderItem[];
  delivery_address: DeliveryAddress;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string | null;
  payment_proof_url?: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  special_instructions: string | null;
  estimated_delivery_minutes: number | null;
  created_at: string;
  updated_at: string;
  // Joined
  profile?: Profile;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers: SelectedModifier[];
  special_instructions: string | null;
}

// ─── Locations ────────────────────────────────────────────────
export type City = 'islamabad' | 'rawalpindi' | 'lahore' | 'karachi';

export interface Location {
  id: UUID;
  name: string;
  city: City;
  address: string;
  opening_hours: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  is_open: boolean;
  badge: string | null;
  sort_order: number;
  created_at: string;
}

// ─── Delivery Zones ───────────────────────────────────────────
export interface DeliveryZone {
  id: string;
  city: string;
  name: string;
  fee: number;
  free_delivery_threshold: number;
  estimated_delivery_minutes: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Order Status History ─────────────────────────────────────
export interface OrderStatusHistory {
  id: UUID;
  order_id: UUID;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

// ─── Newsletter ───────────────────────────────────────────────
export interface NewsletterSubscriber {
  id: UUID;
  email: string;
  created_at: string;
}

// ─── Deals ────────────────────────────────────────────────────
export interface Deal {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price: number;
  original_price: number;
  discount_percentage: number;
  badge: string | null;
  items_description: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  created_at: string;
}

// ─── Reviews ──────────────────────────────────────────────────
export interface Review {
  id: UUID;
  user_id: UUID;
  author_name?: string;
  product_id: UUID | null;
  order_id: UUID | null;
  rating: number; // 1-5
  title: string | null;
  body: string;
  is_approved: boolean;
  created_at: string;
  // Joined
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  product?: Pick<Product, 'id' | 'name'>;
}

// ─── Coupons ──────────────────────────────────────────────────
export interface Coupon {
  id: UUID;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  expires_at?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  created_at: string;
}

// ─── Site Settings ────────────────────────────────────────────
export interface SiteSettings {
  id: UUID;
  key: string;
  value: string;
  updated_at: string;
}

// ─── UI State ─────────────────────────────────────────────────
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

// ─── Checkout ─────────────────────────────────────────────────
export type CheckoutStep =
  | 'cart'
  | 'customer'
  | 'address'
  | 'payment'
  | 'review'
  | 'confirmation';

export interface CheckoutFormData {
  full_name: string;
  phone: string;
  email: string;
  street: string;
  area: string;
  city: string;
  delivery_instructions: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  payment_proof_url?: string | null;
  coupon_code: string;
  special_instructions: string;
}

// ─── API Responses ────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// ─── Admin ────────────────────────────────────────────────────
export type AdminSection =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'deals'
  | 'locations'
  | 'reviews'
  | 'customers'
  | 'coupons'
  | 'settings';

export interface DashboardStats {
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
  completed_orders: number;
  total_products: number;
  total_customers: number;
}
