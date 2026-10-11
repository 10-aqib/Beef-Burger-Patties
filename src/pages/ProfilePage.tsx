import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { User, Package, LogOut, ShieldCheck, ArrowRight, Clock } from 'lucide-react'
import { getUserOrders } from '@/services/orderService'
import { formatPrice, formatDate } from '@/utils'
import type { Order } from '@/types'

export default function ProfilePage() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { openAuthModal } = useUIStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'My Account | Paput Burgers'
    if (user?.id) {
      setLoadingOrders(true)
      getUserOrders(user.id).then((res) => {
        setOrders(res)
        setLoadingOrders(false)
      })
    }
  }, [user?.id])

  if (!user) {
    return (
      <main id="main-content" className="min-h-screen pt-28 pb-20 flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="card p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#1C1B1B] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-4 text-[#FF3B1F]">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-headline-sm font-display font-bold text-white uppercase mb-2">
            SIGN IN TO VIEW YOUR PROFILE
          </h1>
          <p className="text-body-sm text-[#A3A3A3] mb-6">
            Track your past and active burger orders, manage delivery addresses, and save favorites.
          </p>
          <button className="btn-primary text-label-md px-8 py-3 w-full" onClick={() => openAuthModal('login')}>
            SIGN IN / REGISTER
          </button>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max max-w-3xl">
        {/* User Card */}
        <motion.div
          className="card p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-white text-2xl shadow-lg"
              style={{ background: '#FF3B1F' }}
            >
              {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-white text-xl uppercase tracking-tight">
                  {profile?.full_name || 'Paput Burgers VIP Member'}
                </h1>
                {isAdmin && <span className="badge badge-red text-[10px]">ADMIN</span>}
              </div>
              <p className="text-body-sm text-[#A3A3A3] mt-0.5">{user.email}</p>
              {profile?.phone && <p className="text-xs text-[#737373] mt-0.5">{profile.phone}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdmin && (
              <Link to="/admin" className="btn-secondary text-xs px-3.5 py-2">
                ADMIN PANEL
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="w-9 h-9 rounded bg-[#1C1B1B] hover:bg-[#FF3B1F] text-[#A3A3A3] hover:text-white flex items-center justify-center transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Order History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-display font-bold text-white uppercase tracking-tight">
              YOUR ORDER HISTORY
            </h2>
            <Link to="/order-tracking" className="text-label-sm text-[#F59E0B] hover:underline uppercase font-display">
              Track by Code
            </Link>
          </div>

          {loadingOrders ? (
            <div className="card p-8 text-center text-[#737373]">Loading your past orders...</div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <Package className="w-10 h-10 text-[#525252] mx-auto mb-3" />
              <h3 className="text-white font-display font-bold uppercase mb-1">
                NO ORDERS YET
              </h3>
              <p className="text-body-sm text-[#737373] mb-6">
                You haven't placed an order with Paput Burgers yet. Let's fix that!
              </p>
              <Link to="/menu" className="btn-primary text-label-md px-6 py-2.5">
                START YOUR FIRST ORDER
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="card p-5 hover:border-[#383838] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2A2A]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#F59E0B]">
                          #{ord.order_number}
                        </span>
                        <span className="badge badge-dark text-[9px] uppercase">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-[#737373] mt-1 block">
                        Placed on {formatDate(ord.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-display font-bold text-white text-base">
                        {formatPrice(ord.total)}
                      </span>
                      <Link
                        to={`/order-tracking/${ord.order_number}`}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        <span>TRACK</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {ord.items && ord.items.length > 0 && (
                    <div className="pt-3 text-xs text-[#A3A3A3]">
                      {ord.items.map((i) => `${i.quantity}× ${i.product_name}`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
