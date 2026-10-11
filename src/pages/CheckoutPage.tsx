import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Tag,
  RefreshCw,
  Copy,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils'
import type { PaymentMethod, CheckoutFormData } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { createOrder } from '@/services/orderService'
import { validateCoupon, type CouponValidationResult } from '@/services/couponService'
import { sendOrderConfirmationNotification } from '@/services/notificationService'
import toast from 'react-hot-toast'

const CITIES = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi']

const PAYMENT_METHODS: Array<{
  id: PaymentMethod
  label: string
  icon: string
  description: string
  instructions?: string
}> = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: '💵',
    description: 'Pay cash to rider upon doorstep delivery',
    instructions: 'Please keep exact change ready if possible.',
  },
  {
    id: 'raast',
    label: 'Raast Pay',
    icon: '🏦',
    description: 'Instant zero-fee transfer via State Bank Raast',
    instructions: 'Send to Raast ID: 0300-8847624 (Paput Burgers). Rider verifies confirmation SMS.',
  },
  {
    id: 'jazzcash',
    label: 'JazzCash Wallet',
    icon: '📱',
    description: 'Pay with JazzCash mobile account or debit card',
    instructions: 'Send till / wallet payment to 0300-8847624. Keep transaction ID for rider check.',
  },
  {
    id: 'nayapay',
    label: 'NayaPay Wallet',
    icon: '💳',
    description: 'Instant transfer via @paputburgers on NayaPay',
    instructions: 'Transfer to NayaPay ID: @paputburgers. Show payment stamp upon arrival.',
  },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { selectedCity } = useUIStore()
  const { items, getSummary, clearCart } = useCartStore()
  const rawSummary = getSummary()

  React.useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Checkout | Paput Burgers'
  }, [])

  const [form, setForm] = useState<CheckoutFormData>({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    street: '',
    area: '',
    city: selectedCity || 'Islamabad',
    delivery_instructions: '',
    payment_method: 'cod',
    payment_reference: '',
    coupon_code: '',
    special_instructions: '',
  })

  const [step, setStep] = useState<'details' | 'payment' | 'review'>('details')
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})
  const [orderError, setOrderError] = useState<string | null>(null)

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null)

  // Effective calculation
  const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0
  const effectiveTotal = Math.max(0, rawSummary.subtotal + rawSummary.delivery_fee - discount)
  const summary = {
    ...rawSummary,
    discount,
    total: effectiveTotal,
  }

  function update(key: keyof CheckoutFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateDetails() {
    const newErrors: Partial<CheckoutFormData> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Name is required'
    if (!form.phone.trim() || form.phone.length < 10) newErrors.phone = 'Valid 10+ digit phone required'
    if (!form.email.trim() || !form.email.includes('@')) newErrors.email = 'Valid email address required'
    if (!form.street.trim()) newErrors.street = 'Street address is required'
    if (!form.area.trim()) newErrors.area = 'Sector / Area is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleApplyCoupon() {
    const codeToTest = couponInput.trim()
    if (!codeToTest) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError(null)

    const result = await validateCoupon(codeToTest, summary.subtotal)
    setCouponLoading(false)

    if (result.valid) {
      setAppliedCoupon(result)
      update('coupon_code', result.code)
      toast.success(result.message)
    } else {
      setCouponError(result.message)
      toast.error(result.message)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError(null)
    update('coupon_code', '')
    toast('Coupon removed', { icon: '🏷️' })
  }

  async function handlePlaceOrder() {
    if (!validateDetails()) {
      setStep('details')
      return
    }

    setPlacing(true)
    setOrderError(null)

    try {
      const newOrder = await createOrder({
        items,
        summary,
        formData: form,
        userId: user?.id || null,
        estimatedDeliveryMinutes: 30,
      })

      // Send order confirmation receipt notification
      await sendOrderConfirmationNotification(newOrder)

      clearCart()
      toast.success(`Order #${newOrder.order_number} confirmed!`)
      navigate(`/order-confirmation/${newOrder.order_number || newOrder.id}`)
    } catch (err: any) {
      console.error('Order creation error:', err)
      setOrderError(err.message || 'Database error occurred while saving your order. Please retry.')
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placing) {
    return (
      <main id="main-content" className="min-h-screen pt-24 pb-16 flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🍔</div>
          <h1 className="text-headline-md text-white mb-2">Your bag is empty</h1>
          <p className="text-body-md text-[#A3A3A3] mb-6">Add some hot smashed burgers before checking out.</p>
          <Link to="/menu" className="btn-primary text-label-md px-6 py-3">
            BROWSE MENU
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-16" style={{ background: '#080808' }}>
      <div className="container-max max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded flex items-center justify-center text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-bold text-white uppercase" style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>
            Checkout
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {(['details', 'payment', 'review'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <span className={`text-label-sm uppercase ${step === s ? 'text-[#FF3B1F] font-bold' : 'text-[#525252]'}`}>
                  {s === 'details' ? 'Delivery' : s === 'payment' ? 'Payment' : 'Review'}
                </span>
                {i < 2 && <ChevronRight className="w-3 h-3 text-[#383838]" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form column */}
          <div className="lg:col-span-2 space-y-5">
            {step === 'details' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-5"
              >
                <h2 className="font-display font-bold text-white uppercase flex items-center gap-2"
                  style={{ fontSize: '14px', letterSpacing: '0.08em' }}>
                  <MapPin className="w-4 h-4 text-[#FF3B1F]" />
                  Delivery Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                      Full Name *
                    </label>
                    <input
                      className={`input ${errors.full_name ? 'border-red-500' : ''}`}
                      placeholder="Ahmed Khan"
                      value={form.full_name}
                      onChange={(e) => update('full_name', e.target.value)}
                    />
                    {errors.full_name && (
                      <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      className={`input ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="0300 1234567"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                    Email Address *
                  </label>
                  <input
                    className={`input ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="ahmed@example.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                      Street / House / Apt *
                    </label>
                    <input
                      className={`input ${errors.street ? 'border-red-500' : ''}`}
                      placeholder="House 12, Street 34"
                      value={form.street}
                      onChange={(e) => update('street', e.target.value)}
                    />
                    {errors.street && (
                      <p className="text-red-400 text-xs mt-1">{errors.street}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                      Sector / Area *
                    </label>
                    <input
                      className={`input ${errors.area ? 'border-red-500' : ''}`}
                      placeholder="F-7/2"
                      value={form.area}
                      onChange={(e) => update('area', e.target.value)}
                    />
                    {errors.area && (
                      <p className="text-red-400 text-xs mt-1">{errors.area}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">City</label>
                  <select
                    className="input"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-[#171717] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    className="input"
                    placeholder="e.g., Gate code 4821, call when outside"
                    value={form.delivery_instructions}
                    onChange={(e) => update('delivery_instructions', e.target.value)}
                  />
                </div>

                <button
                  className="btn-primary w-full py-3.5 text-label-md justify-center mt-2"
                  onClick={() => {
                    if (validateDetails()) setStep('payment')
                  }}
                >
                  CONTINUE TO PAYMENT
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-5"
              >
                <h2 className="font-display font-bold text-white uppercase flex items-center gap-2"
                  style={{ fontSize: '14px', letterSpacing: '0.08em' }}>
                  <CreditCard className="w-4 h-4 text-[#FF3B1F]" />
                  Select Payment Method
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`w-full p-4 rounded text-left flex items-start gap-3 transition-colors ${
                        form.payment_method === method.id
                          ? 'border border-[#FF3B1F] bg-[rgba(255,59,31,0.06)]'
                          : 'border border-[#2A2A2A] bg-[#171717] hover:border-[#383838]'
                      }`}
                      onClick={() => update('payment_method', method.id)}
                    >
                      <span className="text-2xl mt-0.5">{method.icon}</span>
                      <div className="flex-1">
                        <div className="font-display font-bold text-white uppercase"
                          style={{ fontSize: '13px', letterSpacing: '0.06em' }}>
                          {method.label}
                        </div>
                        <div className="text-body-sm text-[#A3A3A3] mt-0.5">{method.description}</div>
                        {method.instructions && form.payment_method === method.id && (
                          <div className="mt-2 p-2.5 rounded bg-[#101010] border border-[#262626] text-xs text-[#E5E5E5]">
                            {method.instructions}
                          </div>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                        form.payment_method === method.id ? 'border-[#FF3B1F]' : 'border-[#383838]'
                      }`}>
                        {form.payment_method === method.id && (
                          <div className="w-2 h-2 rounded-full bg-[#FF3B1F]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Digital Payment Details & Reference Input */}
                {form.payment_method !== 'cod' && (
                  <div className="p-4 rounded bg-[#121212] border border-[#2A2A2A] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#FF3B1F]" />
                        Account Details
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#F59E0B] bg-[rgba(245,158,11,0.1)] px-2 py-0.5 rounded">
                        Zero Fee
                      </span>
                    </div>

                    <div className="p-3 rounded bg-[#0A0A0A] border border-[#222222] text-xs space-y-2">
                      {form.payment_method === 'raast' && (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[#A3A3A3] block text-[11px]">Raast ID (Mobile):</span>
                            <span className="font-mono text-white font-bold text-sm">0300-8847624</span>
                            <span className="text-[10px] text-[#737373] block">Title: Paput Burgers (Meezan Bank)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText('03008847624')
                              toast.success('Raast ID copied!')
                            }}
                            className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> COPY
                          </button>
                        </div>
                      )}

                      {form.payment_method === 'jazzcash' && (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[#A3A3A3] block text-[11px]">JazzCash Account:</span>
                            <span className="font-mono text-white font-bold text-sm">0300-8847624</span>
                            <span className="text-[10px] text-[#737373] block">Title: Paput Burgers</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText('03008847624')
                              toast.success('JazzCash account copied!')
                            }}
                            className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> COPY
                          </button>
                        </div>
                      )}

                      {form.payment_method === 'nayapay' && (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[#A3A3A3] block text-[11px]">NayaPay Handle:</span>
                            <span className="font-mono text-white font-bold text-sm">@paputburgers</span>
                            <span className="text-[10px] text-[#737373] block">Title: Paput Burgers</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText('@paputburgers')
                              toast.success('NayaPay handle copied!')
                            }}
                            className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> COPY
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1">
                        Transaction Reference / TRX ID (Optional)
                      </label>
                      <input
                        className="input font-mono uppercase text-sm"
                        placeholder="e.g. TID-98234198 or Sender Phone"
                        value={form.payment_reference || ''}
                        onChange={(e) => update('payment_reference', e.target.value)}
                      />
                      <p className="text-[11px] text-[#737373] mt-1">
                        Enter your transfer confirmation ID or sender phone number for fast kitchen verification.
                      </p>
                    </div>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="pt-2 border-t border-[#262626]">
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Coupon Code
                  </label>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded bg-[#064E3B]/40 border border-[#059669] text-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono font-bold tracking-wider">{appliedCoupon.code}</span>
                        <span className="text-xs text-emerald-300">
                          (-{formatPrice(appliedCoupon.discount)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-emerald-300 hover:text-white underline uppercase"
                      >
                        REMOVE
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        className={`input flex-1 uppercase font-mono ${couponError ? 'border-red-500' : ''}`}
                        placeholder="PAPUT10, SMASH200..."
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase())
                          setCouponError(null)
                        }}
                      />
                      <button
                        type="button"
                        disabled={couponLoading || !couponInput.trim()}
                        onClick={handleApplyCoupon}
                        className="btn-secondary text-label-md px-5 disabled:opacity-50"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {couponError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    className="btn-secondary flex-1 py-3 text-label-md justify-center"
                    onClick={() => setStep('details')}
                  >
                    BACK
                  </button>
                  <button
                    className="btn-primary flex-1 py-3 text-label-md justify-center"
                    onClick={() => setStep('review')}
                  >
                    REVIEW ORDER
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Error Banner with Retry */}
                {orderError && (
                  <div className="p-4 rounded bg-red-950/60 border border-red-500 flex items-start gap-3 text-red-200">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <strong className="block font-bold mb-0.5">Order Failed to Process</strong>
                      <p className="text-red-300">{orderError}</p>
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Placement
                      </button>
                    </div>
                  </div>
                )}

                {/* Order items review */}
                <div className="card p-5">
                  <h2 className="font-display font-bold text-white uppercase mb-4"
                    style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                    Order Summary
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-body-sm">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          {item.product.image_url ? (
                            <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#1F1F1F] flex items-center justify-center">🍔</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white uppercase" style={{ fontSize: '11px' }}>
                            {item.product.name}
                          </div>
                          {item.selected_modifiers.length > 0 && (
                            <div className="text-[#737373]" style={{ fontSize: '10px' }}>
                              {item.selected_modifiers.map((m) => m.option_name).join(', ')}
                            </div>
                          )}
                        </div>
                        <span className="text-[#A3A3A3]">×{item.quantity}</span>
                        <span className="font-bold text-white">{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details review */}
                <div className="card p-5 text-body-sm text-[#A3A3A3] space-y-1">
                  <p><span className="text-white font-semibold">{form.full_name}</span> · {form.phone}</p>
                  <p>{form.street}, {form.area}, {form.city}</p>
                  <p>
                    Payment: <span className="text-white font-semibold uppercase">{form.payment_method}</span>
                  </p>
                  {form.delivery_instructions && (
                    <p className="text-xs text-[#737373] italic">"{form.delivery_instructions}"</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn-secondary flex-1 py-3 text-label-md justify-center"
                    onClick={() => setStep('payment')}
                    disabled={placing}
                  >
                    BACK
                  </button>
                  <button
                    className="btn-primary flex-1 py-3.5 text-label-md justify-center shadow-[0_0_24px_-4px_rgba(255,59,31,0.5)] disabled:opacity-50"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        PROCESSING ORDER...
                      </span>
                    ) : (
                      `PLACE ORDER · ${formatPrice(summary.total)}`
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-24">
              <h3 className="font-display font-bold text-white uppercase mb-4"
                style={{ fontSize: '12px', letterSpacing: '0.08em' }}>
                <ShoppingBag className="w-4 h-4 inline mr-1.5 text-[#FF3B1F]" />
                Order Total
              </h3>
              <div className="space-y-2 text-body-sm text-[#A3A3A3]">
                <div className="flex justify-between">
                  <span>Items ({summary.item_count})</span>
                  <span className="text-white">{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={summary.delivery_fee === 0 ? 'text-[#F59E0B] font-semibold' : 'text-white'}>
                    {summary.delivery_fee === 0 ? 'FREE' : formatPrice(summary.delivery_fee)}
                  </span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(summary.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 font-display font-bold" style={{ borderTop: '1px solid #2A2A2A' }}>
                  <span className="text-white uppercase text-label-md">Total</span>
                  <span className="text-[#F59E0B]" style={{ fontSize: '20px' }}>
                    {formatPrice(summary.total)}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded text-body-sm text-[#A3A3A3] flex items-center gap-2"
                style={{ background: '#0D0D0D', border: '1px solid #1F1F1F' }}>
                <span className="text-[#F59E0B] text-xl">⏱</span>
                <span>Estimated delivery: <strong className="text-white">25–40 min</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
