import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, CheckCircle, Clock, Package, MapPin, Flame, Bike, AlertCircle } from 'lucide-react'
import { getOrderByIdOrNumber, subscribeToOrderUpdates } from '@/services/orderService'
import { formatPrice, formatDate } from '@/utils'
import type { Order, OrderItem, OrderStatus, OrderStatusHistory } from '@/types'

const TRACKING_STEPS: Array<{
  id: OrderStatus
  label: string
  icon: React.ElementType
  desc: string
}> = [
  { id: 'placed', label: 'Order Placed', icon: CheckCircle, desc: 'Received at forge dispatch' },
  { id: 'confirmed', label: 'Confirmed', icon: Flame, desc: 'Accepted by kitchen team' },
  { id: 'preparing', label: 'Smashing on Steel', icon: Package, desc: '450°F Maillard crust sear' },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, desc: 'Rider is on the way' },
  { id: 'delivered', label: 'Delivered', icon: MapPin, desc: 'Enjoy your hot smash!' },
]

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'placed': return 0
    case 'confirmed': return 1
    case 'preparing': return 2
    case 'ready': return 2
    case 'out_for_delivery': return 3
    case 'delivered': return 4
    case 'cancelled': return -1
    default: return 0
  }
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [inputCode, setInputCode] = useState(id || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Track Your Order | Paput Burgers'
    let unsubscribe: (() => void) | undefined

    if (id) {
      setLoading(true)
      setSearched(true)
      getOrderByIdOrNumber(id.trim()).then((result) => {
        setOrder(result.order)
        setItems(result.items)
        setHistory(result.history)
        setLoading(false)

        if (result.order) {
          unsubscribe = subscribeToOrderUpdates(result.order.id, (payload) => {
            setOrder((prev) =>
              prev ? { ...prev, status: payload.status, updated_at: payload.updated_at } : prev
            )
          })
        }
      })
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [id])

  async function loadOrder(orderNumberOrId: string) {
    if (!orderNumberOrId.trim()) return
    setLoading(true)
    setSearched(true)

    const result = await getOrderByIdOrNumber(orderNumberOrId.trim())
    setOrder(result.order)
    setItems(result.items)
    setHistory(result.history)
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (inputCode.trim()) {
      navigate(`/order-tracking/${inputCode.trim()}`)
    }
  }

  const currentStep = order ? getStepIndex(order.status) : 0

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#F59E0B]">
              LIVE DISPATCH RADAR
            </span>
          </motion.div>

          <h1 className="text-headline-lg font-display font-bold text-white uppercase tracking-tight mb-4">
            TRACK YOUR <span className="text-[#FF3B1F]">ORDER.</span>
          </h1>

          <p className="text-body-md text-[#A3A3A3] max-w-md mx-auto">
            Enter your order number (e.g. PAPUT-202610-1234) to track real-time kitchen progress.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mt-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="input pl-10 uppercase tracking-wider font-mono text-sm"
                placeholder="PAPUT-202610-XXXX"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary px-5 text-label-md shrink-0">
              TRACK
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF3B1F] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-label-sm text-[#A3A3A3] uppercase tracking-widest">
              Connecting to Forge Telemetry...
            </span>
          </div>
        )}

        {/* Not Found */}
        {!loading && searched && !order && (
          <div className="card p-10 text-center max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-[#FF3B1F] mx-auto mb-3" />
            <h2 className="text-headline-sm text-white font-display font-bold uppercase mb-2">
              ORDER NOT FOUND
            </h2>
            <p className="text-body-sm text-[#A3A3A3] mb-6">
              We couldn't locate an order with code "{inputCode}". Please double-check your receipt or SMS confirmation.
            </p>
            <Link to="/menu" className="btn-secondary text-label-md px-6 py-2.5">
              BROWSE MENU
            </Link>
          </div>
        )}

        {/* Order Details & Timeline */}
        {!loading && order && (
          <div className="space-y-6">
            {/* Live Status Header */}
            <div className="card p-6 border-l-4 border-l-[#FF3B1F]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block mb-1">
                    LIVE STATUS TELEMETRY
                  </span>
                  <h2 className="text-headline-md font-display font-bold text-white uppercase">
                    {order.status.replace(/_/g, ' ')}
                  </h2>
                  <span className="text-body-sm text-[#737373] font-mono">
                    ORDER #{order.order_number}
                  </span>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-[#34D399] font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                    LIVE UPDATING
                  </div>
                  <span className="text-body-sm text-[#A3A3A3] mt-1 block">
                    ETA: ~{order.estimated_delivery_minutes || 30} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="card p-6 md:p-8">
              <h3 className="text-label-md font-display font-bold text-white uppercase tracking-wider mb-8">
                PREPARATION TIMELINE
              </h3>

              <div className="space-y-6">
                {TRACKING_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStep
                  const isCurrent = idx === currentStep
                  const Icon = step.icon

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? 'bg-[#34D399] text-black font-bold'
                            : isCurrent
                            ? 'bg-[#FF3B1F] text-white shadow-[0_0_20px_rgba(255,59,31,0.6)]'
                            : 'bg-[#1F1F1F] text-[#525252] border border-[#2A2A2A]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 pt-1">
                        <div className="flex items-baseline justify-between">
                          <h4
                            className={`font-display font-bold uppercase text-sm tracking-wider ${
                              isCurrent ? 'text-[#FF3B1F]' : isCompleted ? 'text-white' : 'text-[#525252]'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="badge badge-amber text-[9px]">IN PROGRESS</span>
                          )}
                        </div>
                        <p className="text-body-sm text-[#A3A3A3] mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Items & Receipt */}
            <div className="card p-6">
              <h3 className="text-label-md font-display font-bold text-white uppercase tracking-wider mb-4">
                ORDER SUMMARY
              </h3>

              <div className="divide-y divide-[#2A2A2A]">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <span className="text-body-sm font-bold text-white">
                        {item.quantity}× {item.product_name}
                      </span>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="text-[11px] text-[#A3A3A3] mt-0.5">
                          + {item.modifiers.map((m) => m.option_name).join(', ')}
                        </div>
                      )}
                      {item.special_instructions && (
                        <div className="text-[11px] text-[#F59E0B] italic mt-0.5">
                          Note: "{item.special_instructions}"
                        </div>
                      )}
                    </div>
                    <span className="text-body-sm font-display font-bold text-[#F59E0B]">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#2A2A2A] space-y-2 text-body-sm">
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Delivery Fee</span>
                  <span className="text-white">
                    {order.delivery_fee === 0 ? 'FREE' : formatPrice(order.delivery_fee)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#A3A3A3]">
                    <span>Discount</span>
                    <span className="text-[#F59E0B]">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold pt-2 border-t border-[#2A2A2A] text-base">
                  <span>Total ({order.payment_method.toUpperCase()})</span>
                  <span className="text-[#F59E0B] font-display font-bold">
                    {formatPrice(order.total)}
                  </span>
                </div>
                {order.payment_reference && (
                  <div className="flex justify-between text-xs text-[#A3A3A3] pt-1">
                    <span>Payment Ref (TRX ID)</span>
                    <span className="font-mono text-emerald-400 font-semibold">{order.payment_reference}</span>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="mt-6 pt-4 border-t border-[#2A2A2A] text-body-sm text-[#A3A3A3]">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">
                  DELIVERING TO:
                </span>
                <p className="text-white font-medium">{order.delivery_address?.full_name} ({order.delivery_address?.phone})</p>
                <p>{order.delivery_address?.street}, {order.delivery_address?.area}, {order.delivery_address?.city}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
