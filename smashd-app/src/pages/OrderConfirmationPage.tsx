import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Clock, MapPin, Package, ArrowRight, ShoppingBag } from 'lucide-react'
import { getOrderByIdOrNumber } from '@/services/orderService'
import { formatPrice } from '@/utils'
import type { Order, OrderItem } from '@/types'

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Order Confirmed | Beef Burger Patties'
    if (id) {
      getOrderByIdOrNumber(id).then((res) => {
        setOrder(res.order)
        setItems(res.items)
        setLoading(false)
      })
    }
  }, [id])

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max max-w-2xl">
        {/* Success banner */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-[rgba(52,211,153,0.1)] border border-[#34D399] flex items-center justify-center mx-auto mb-5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <CheckCircle className="w-10 h-10 text-[#34D399]" />
          </motion.div>

          <motion.h1
            className="font-display font-bold text-white uppercase mb-2"
            style={{ fontSize: '28px', letterSpacing: '-0.03em' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Thanks for Ordering!
          </motion.h1>

          <motion.p
            className="text-body-md text-[#A3A3A3]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Thanks for ordering from Beef Burger Patties! Your order{' '}
            <span className="font-display font-bold text-[#F59E0B]">
              {order?.order_number || id}
            </span>{' '}
            has been placed with our kitchen.
          </motion.p>
        </motion.div>

        {/* Live Tracking Link Card */}
        <div className="card p-6 mb-6 border border-[#FF3B1F]/40 bg-gradient-to-br from-[#1C1B1B] to-[#121212]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> ESTIMATED DISPATCH: ~30 MINS
              </div>
              <h3 className="text-white font-display font-bold uppercase text-lg">
                FOLLOW YOUR BURGER IN REAL-TIME
              </h3>
            </div>
            <Link
              to={`/order-tracking/${order?.order_number || id}`}
              className="btn-primary text-label-md px-5 py-2.5 flex items-center justify-center gap-2 shrink-0"
            >
              <span>TRACK ORDER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Receipt details */}
        {order && (
          <div className="card p-6 space-y-4 mb-6">
            <h3 className="text-label-md font-display font-bold text-white uppercase tracking-wider pb-2 border-b border-[#2A2A2A]">
              RECEIPT BREAKDOWN
            </h3>

            <div className="divide-y divide-[#2A2A2A] text-body-sm">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between">
                  <span className="text-[#D1D1D1]">
                    <strong className="text-white">{item.quantity}×</strong> {item.product_name}
                  </span>
                  <span className="text-white font-display font-bold">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#2A2A2A] space-y-1.5 text-body-sm">
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
              <div className="flex justify-between text-white font-bold pt-2 border-t border-[#2A2A2A]">
                <span>Total Due ({order.payment_method.toUpperCase()})</span>
                <span className="text-[#F59E0B] font-display font-bold text-lg">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A2A2A] text-xs text-[#737373]">
              <span>Delivering to: </span>
              <span className="text-white font-medium">
                {order.delivery_address?.full_name}, {order.delivery_address?.street}, {order.delivery_address?.city}
              </span>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/menu" className="btn-secondary text-label-md px-8 py-3">
            ORDER MORE FROM MENU
          </Link>
        </div>
      </div>
    </main>
  )
}
