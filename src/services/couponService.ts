import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Coupon } from '@/types'

// Default offline / fallback coupons matching seed data
const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-welcome',
    code: 'PAPUT10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1000,
    max_discount: 300,
    usage_limit: 10000,
    usage_count: 0,
    is_active: true,
    valid_from: '2026-01-01T00:00:00Z',
    valid_to: '2026-12-31T23:59:59Z',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'coup-smash200',
    code: 'SMASH200',
    discount_type: 'fixed',
    discount_value: 200,
    min_order_amount: 1500,
    max_discount: null,
    usage_limit: 5000,
    usage_count: 0,
    is_active: true,
    valid_from: '2026-01-01T00:00:00Z',
    valid_to: '2026-12-31T23:59:59Z',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'coup-feast500',
    code: 'FEAST500',
    discount_type: 'fixed',
    discount_value: 500,
    min_order_amount: 3000,
    max_discount: null,
    usage_limit: 1000,
    usage_count: 0,
    is_active: true,
    valid_from: '2026-01-01T00:00:00Z',
    valid_to: '2026-12-31T23:59:59Z',
    created_at: '2026-01-01T00:00:00Z',
  },
]

export interface CouponValidationResult {
  valid: boolean
  code: string
  discount: number
  message: string
  coupon?: Coupon
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    return { valid: false, code: '', discount: 0, message: 'Please enter a coupon code.' }
  }

  let coupon: Coupon | undefined

  if (isSupabaseConfigured) {
    try {
      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('Coupon query timeout')), 2000)
      )
      const queryPromise = supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle()

      const res = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = res as { data: unknown; error: unknown }

      if (!error && data) {
        coupon = data as Coupon
      }
    } catch {
      // If Supabase table is unreachable or timed out, fallback to default coupons
    }
  }

  if (!coupon) {
    coupon = DEFAULT_COUPONS.find((c) => c.code === cleanCode && c.is_active)
  }

  if (!coupon) {
    return {
      valid: false,
      code: cleanCode,
      discount: 0,
      message: `Coupon code "${cleanCode}" is invalid or expired.`,
    }
  }

  // Check validity dates
  const now = new Date().getTime()
  if (coupon.valid_from && new Date(coupon.valid_from).getTime() > now) {
    return {
      valid: false,
      code: cleanCode,
      discount: 0,
      message: `Coupon "${cleanCode}" is not active yet.`,
    }
  }

  const expiryDate = coupon.expires_at || coupon.valid_to
  if (expiryDate && new Date(expiryDate).getTime() < now) {
    return {
      valid: false,
      code: cleanCode,
      discount: 0,
      message: `Coupon "${cleanCode}" has expired.`,
    }
  }

  // Check minimum order amount
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      code: cleanCode,
      discount: 0,
      message: `Minimum order amount of Rs. ${coupon.min_order_amount.toLocaleString()} required for ${cleanCode}.`,
    }
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return {
      valid: false,
      code: cleanCode,
      discount: 0,
      message: `Coupon "${cleanCode}" usage limit has been reached.`,
    }
  }

  // Calculate discount
  let discount = 0
  if (coupon.discount_type === 'percentage') {
    discount = Math.floor((subtotal * coupon.discount_value) / 100)
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount
    }
  } else {
    discount = Math.floor(coupon.discount_value)
  }

  // Cannot exceed subtotal
  discount = Math.min(discount, subtotal)

  return {
    valid: true,
    code: cleanCode,
    discount,
    message: `Coupon ${cleanCode} applied successfully! You saved Rs. ${discount.toLocaleString()}.`,
    coupon,
  }
}
