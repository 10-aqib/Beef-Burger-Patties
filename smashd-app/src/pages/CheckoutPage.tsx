import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, CheckCircle, Loader2, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils'
import type { PaymentMethod, CheckoutFormData } from '@/types'

import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { createOrder } from '@/services/orderService'

const CITIES = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi']
const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: string; description: string }> = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', description: 'Pay in cash when your order arrives' },
  { id: 'raast', label: 'Raast Pay', icon: '🏦', description: 'Instant bank transfer via Raast' },
  { id: 'jazzcash', label: 'JazzCash', icon: '📱', description: 'Pay with your JazzCash wallet' },
  { id: 'nayapay', label: 'NayaPay', icon: '💳', description: 'Pay with your NayaPay wallet' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { selectedCity } = useUIStore()
  const { items, getSummary, clearCart } = useCartStore()
  const summary = getSummary()

  React.useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Checkout | Beef Burger Patties'
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
    coupon_code: '',
    special_instructions: '',
  })
  const [step, setStep] = useState<'details' | 'payment' | 'review'>('details')
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})

  function update(key: keyof CheckoutFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateDetails() {
    const newErrors: Partial<CheckoutFormData> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Name is required'
    if (!form.phone.trim() || form.phone.length < 10) newErrors.phone = 'Valid phone required'
    if (!form.email.trim() || !form.email.includes('@')) newErrors.email = 'Valid email required'
    if (!form.street.trim()) newErrors.street = 'Address is required'
    if (!form.area.trim()) newErrors.area = 'Area/Sector is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePlaceOrder() {
    if (!validateDetails()) {
      setStep('details')
      return
    }

    setPlacing(true)
    try {
      const newOrder = await createOrder({
        items,
        summary,
        formData: form,
        userId: user?.id || null,
        estimatedDeliveryMinutes: 30,
      })

      clearCart()
      navigate(`/order-confirmation/${newOrder.order_number || newOrder.id}`)
    } catch (err: any) {
      console.error('Real order error:', err)
      setErrors({ full_name: 'Database connection issue. Please retry.' })
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placing) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🍔</div>
          <h1 className="text-headline-md text-white mb-2">Your bag is empty</h1>
          <p className="text-body-md text-[#A3A3A3] mb-6">Add some items before checking out.</p>
          <Link to="/menu" className="btn-primary text-label-md px-6 py-3">
            BROWSE MENU
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-16" style={{ background: '#080808' }}>
      <div className="container-max max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded flex items-center justify-center text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-bold text-white uppercase" style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>
            Checkout
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {(['details', 'payment', 'review'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <span className={`text-label-sm uppercase ${step === s ? 'text-[#FF3B1F]' : 'text-[#525252]'}`}>
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
                  style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                  <MapPin className="w-4 h-4 text-[#FF3B1F]" /> Delivery Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">Full Name *</label>
                    <input className={`input ${errors.full_name ? 'border-[#FF3B1F]' : ''}`}
                      placeholder="Muhammad Ali Khan" value={form.full_name}
                      onChange={(e) => update('full_name', e.target.value)} />
                    {errors.full_name && <p className="text-[#FF3B1F] text-body-sm mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">Phone *</label>
                    <input className={`input ${errors.phone ? 'border-[#FF3B1F]' : ''}`}
                      placeholder="0311-1234567" value={form.phone} type="tel"
                      onChange={(e) => update('phone', e.target.value)} />
                    {errors.phone && <p className="text-[#FF3B1F] text-body-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">Email *</label>
                  <input className={`input ${errors.email ? 'border-[#FF3B1F]' : ''}`}
                    placeholder="you@example.com" value={form.email} type="email"
                    onChange={(e) => update('email', e.target.value)} />
                  {errors.email && <p className="text-[#FF3B1F] text-body-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">Street Address *</label>
                  <input className={`input ${errors.street ? 'border-[#FF3B1F]' : ''}`}
                    placeholder="House #12, Street 5, F-8/2" value={form.street}
                    onChange={(e) => update('street', e.target.value)} />
                  {errors.street && <p className="text-[#FF3B1F] text-body-sm mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">Area / Sector *</label>
                    <input className={`input ${errors.area ? 'border-[#FF3B1F]' : ''}`}
                      placeholder="F-7 Markaz / DHA Phase 5" value={form.area}
                      onChange={(e) => update('area', e.target.value)} />
                    {errors.area && <p className="text-[#FF3B1F] text-body-sm mt-1">{errors.area}</p>}
                  </div>
                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">City</label>
                    <select
                      className="input"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                    >
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">Delivery Instructions</label>
                  <textarea className="input resize-none" rows={2}
                    placeholder="Ring the bell, leave at door, call on arrival..." value={form.delivery_instructions}
                    onChange={(e) => update('delivery_instructions', e.target.value)} />
                </div>

                <button
                  className="btn-primary w-full py-3.5 text-label-lg justify-center"
                  onClick={() => { if (validateDetails()) setStep('payment') }}
                >
                  CONTINUE TO PAYMENT
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-4"
              >
                <h2 className="font-display font-bold text-white uppercase flex items-center gap-2"
                  style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                  <CreditCard className="w-4 h-4 text-[#FF3B1F]" /> Payment Method
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      className={`w-full flex items-center gap-4 p-4 rounded text-left transition-all ${
                        form.payment_method === method.id
                          ? 'border border-[#FF3B1F] bg-[rgba(255,59,31,0.05)]'
                          : 'border border-[#2A2A2A] bg-[#171717] hover:border-[#383838]'
                      }`}
                      onClick={() => update('payment_method', method.id)}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <div className="font-display font-bold text-white uppercase"
                          style={{ fontSize: '12px', letterSpacing: '0.06em' }}>
                          {method.label}
                        </div>
                        <div className="text-body-sm text-[#737373] mt-0.5">{method.description}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        form.payment_method === method.id ? 'border-[#FF3B1F]' : 'border-[#383838]'
                      }`}>
                        {form.payment_method === method.id && (
                          <div className="w-2 h-2 rounded-full bg-[#FF3B1F]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">Coupon Code</label>
                  <div className="flex gap-2">
                    <input className="input flex-1" placeholder="BEEF20" value={form.coupon_code}
                      onChange={(e) => update('coupon_code', e.target.value)} />
                    <button className="btn-secondary text-label-md px-4">APPLY</button>
                  </div>
                </div>

                <div className="flex gap-3">
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
                          {item.product.image_url
                            ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-[#1F1F1F] flex items-center justify-center">🍔</div>
                          }
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
                  <p>Payment: <span className="text-white font-semibold capitalize">{form.payment_method.replace('_', ' ')}</span></p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn-secondary flex-1 py-3 text-label-md justify-center"
                    onClick={() => setStep('payment')}
                  >
                    BACK
                  </button>
                  <button
                    className="btn-primary flex-1 py-3.5 text-label-md justify-center shadow-[0_0_24px_-4px_rgba(255,59,31,0.5)]"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
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
