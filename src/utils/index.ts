// ============================================================
// Beef Burger Patties — Utility Functions
// ============================================================

/**
 * Format a price in Pakistani Rupees
 */
export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`
}

/**
 * Generate a short order number (e.g. BBP-2094)
 */
export function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `BBP-${num}`
}

/**
 * Set page title dynamically
 */
export function setPageTitle(title: string): void {
  if (typeof document !== 'undefined') {
    document.title = title
  }
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format a timestamp into a readable date
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a timestamp into a readable time
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format an order status to a display string
 */
export function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return map[status] || status
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation (for smooth mouse parallax)
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Generate a unique local ID (for cart items)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Scroll smoothly to an element by ID
 */
export function scrollToId(id: string, offset = 80): void {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

/**
 * Format a Pakistani phone number
 */
export function formatPhone(phone: string): string {
  // Normalize: strip non-digits
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('92') && digits.length === 12) {
    return `+92 ${digits.slice(2, 5)}-${digits.slice(5, 12)}`
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `0${digits.slice(1, 4)}-${digits.slice(4)}`
  }
  return phone
}

/**
 * Get initials from a full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

/**
 * Convert a slug to a display name
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Render star rating as a string (e.g. "★★★★½")
 */
export function renderStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty)
}
