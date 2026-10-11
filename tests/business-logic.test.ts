import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  parseTimeStringToMinutes,
  isLocationCurrentlyOpen,
} from '../src/utils/index.ts'
import { generateCanonicalOrderNumber } from '../src/services/orderService.ts'
import { validateCoupon } from '../src/services/couponService.ts'

describe('Price Formatting Utility', () => {
  it('formats positive numbers with Pakistani Rupee prefix', () => {
    expect(formatPrice(1250)).toBe('Rs. 1,250')
    expect(formatPrice(0)).toBe('Rs. 0')
  })

  it('handles string input cleanly', () => {
    expect(formatPrice('Rs. 950')).toBe('Rs. 950')
    expect(formatPrice('PKR 1200')).toBe('Rs. 1,200')
    expect(formatPrice('850')).toBe('Rs. 850')
  })

  it('gracefully handles invalid, negative or null values', () => {
    expect(formatPrice(-50)).toBe('Rs. 0')
    expect(formatPrice(null)).toBe('Rs. 0')
    expect(formatPrice(undefined)).toBe('Rs. 0')
    expect(formatPrice('invalid')).toBe('Rs. 0')
  })
})

describe('Time and Branch Operating Hours', () => {
  it('parses time strings into minutes correctly', () => {
    expect(parseTimeStringToMinutes('12:00 AM')).toBe(0)
    expect(parseTimeStringToMinutes('04:00 AM')).toBe(240)
    expect(parseTimeStringToMinutes('12:00 PM')).toBe(720)
    expect(parseTimeStringToMinutes('01:30 PM')).toBe(810)
    expect(parseTimeStringToMinutes('11:59 PM')).toBe(1439)
  })

  it('correctly evaluates midnight-crossing branch hours (12:00 PM to 04:00 AM)', () => {
    const hours = '12:00 PM – 04:00 AM'

    // 02:00 AM in Pakistan -> Open
    // Create UTC date that is 02:00 in Asia/Karachi (UTC+5 -> 21:00 prev day UTC)
    const open2AM = new Date('2026-10-10T21:00:00Z')
    const res2AM = isLocationCurrentlyOpen(hours, true, open2AM)
    expect(res2AM.isOpen).toBe(true)
    expect(res2AM.statusText).toBe('OPEN NOW')

    // 06:00 AM in Pakistan -> Closed (UTC+5 -> 01:00 UTC)
    const closed6AM = new Date('2026-10-11T01:00:00Z')
    const res6AM = isLocationCurrentlyOpen(hours, true, closed6AM)
    expect(res6AM.isOpen).toBe(false)
    expect(res6AM.statusText).toBe('CLOSED NOW')

    // 03:00 PM in Pakistan -> Open (UTC+5 -> 10:00 UTC)
    const open3PM = new Date('2026-10-11T10:00:00Z')
    const res3PM = isLocationCurrentlyOpen(hours, true, open3PM)
    expect(res3PM.isOpen).toBe(true)
    expect(res3PM.statusText).toBe('OPEN NOW')
  })

  it('marks inactive locations as COMING SOON', () => {
    const res = isLocationCurrentlyOpen('12:00 PM – 04:00 AM', false)
    expect(res.isOpen).toBe(false)
    expect(res.statusText).toBe('COMING SOON')
  })
})

describe('Order Canonical Number Generation', () => {
  it('produces PAPUT-YYYYMM-XXXX formatted sequence', () => {
    const num = generateCanonicalOrderNumber()
    expect(num).toMatch(/^PAPUT-\d{6}-\d{4}$/)
  })
})

describe('Authoritative Coupon Validation', () => {
  it('applies percentage coupon PAPUT10 up to max discount cap', async () => {
    // 10% of 2000 is 200
    const res1 = await validateCoupon('PAPUT10', 2000)
    expect(res1.valid).toBe(true)
    expect(res1.discount).toBe(200)

    // 10% of 4000 is 400, but capped at 300
    const res2 = await validateCoupon('PAPUT10', 4000)
    expect(res2.valid).toBe(true)
    expect(res2.discount).toBe(300)
  })

  it('enforces minimum order amount for coupons', async () => {
    // PAPUT10 requires min 1000
    const res = await validateCoupon('PAPUT10', 800)
    expect(res.valid).toBe(false)
    expect(res.discount).toBe(0)
    expect(res.message).toMatch(/Minimum order amount/)
  })

  it('applies fixed discount coupon SMASH200', async () => {
    const res = await validateCoupon('SMASH200', 1600)
    expect(res.valid).toBe(true)
    expect(res.discount).toBe(200)
  })

  it('rejects invalid coupon codes cleanly', async () => {
    const res = await validateCoupon('NOTREALCODE', 2000)
    expect(res.valid).toBe(false)
    expect(res.discount).toBe(0)
    expect(res.message).toMatch(/invalid or expired/i)
  })
})
