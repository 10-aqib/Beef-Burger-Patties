import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  RefreshCw,
  CheckCircle,
  Clock,
  Bike,
  AlertCircle,
  Filter,
  DollarSign
} from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '@/services/orderService'
import { getProducts } from '@/services/productService'
import { getKitchenStatus, getDeliveryConfig } from '@/services/settingsService'
import { formatPrice, formatDate } from '@/utils'
import type { Order, OrderStatus, Product } from '@/types'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Beef Burger Patties Admin | Kitchen Operations'
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [fetchedOrders, fetchedProducts] = await Promise.all([
      getAllOrders(),
      getProducts(),
    ])
    setOrders(fetchedOrders)
    setProducts(fetchedProducts)
    setLoading(false)
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const success = await updateOrderStatus(orderId, newStatus)
    if (success) {
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    } else {
      toast.error('Failed to update status')
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesSearch =
      searchTerm === '' ||
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.delivery_address?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.delivery_address?.phone?.includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'out_for_delivery'
  ).length

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
              <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#34D399]">
                BEEF BURGER PATTIES DASHBOARD
              </span>
            </div>
            <h1 className="text-headline-md sm:text-headline-lg font-display font-bold text-white uppercase tracking-tight">
              KITCHEN <span className="text-[#FF3B1F]">OPERATIONS.</span>
            </h1>
          </div>

          <button
            onClick={loadData}
            className="btn-secondary self-start sm:self-auto text-label-sm px-4 py-2 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> REFRESH FEED
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <span className="text-label-sm text-[#737373] uppercase tracking-wider block mb-1">
              ACTIVE ORDERS
            </span>
            <div className="text-2xl font-display font-bold text-[#F59E0B]">
              {activeOrdersCount}
            </div>
            <span className="text-[11px] text-[#A3A3A3] mt-1 block">In preparation or transit</span>
          </div>

          <div className="card p-5">
            <span className="text-label-sm text-[#737373] uppercase tracking-wider block mb-1">
              TOTAL ORDERS
            </span>
            <div className="text-2xl font-display font-bold text-white">
              {orders.length}
            </div>
            <span className="text-[11px] text-[#A3A3A3] mt-1 block">Recorded in database</span>
          </div>

          <div className="card p-5">
            <span className="text-label-sm text-[#737373] uppercase tracking-wider block mb-1">
              REVENUE TOTAL
            </span>
            <div className="text-2xl font-display font-bold text-[#34D399]">
              {formatPrice(totalRevenue)}
            </div>
            <span className="text-[11px] text-[#A3A3A3] mt-1 block">Gross sales volume</span>
          </div>

          <div className="card p-5">
            <span className="text-label-sm text-[#737373] uppercase tracking-wider block mb-1">
              MENU CATALOG
            </span>
            <div className="text-2xl font-display font-bold text-white">
              {products.length} Products
            </div>
            <span className="text-[11px] text-[#A3A3A3] mt-1 block">Active forge items</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2A2A2A] mb-8 gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-label-md font-display font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'text-[#FF3B1F] border-[#FF3B1F]'
                : 'text-[#A3A3A3] border-transparent hover:text-white'
            }`}
          >
            LIVE ORDERS ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-label-md font-display font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'text-[#FF3B1F] border-[#FF3B1F]'
                : 'text-[#A3A3A3] border-transparent hover:text-white'
            }`}
          >
            MENU INVENTORY ({products.length})
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              <div className="flex flex-wrap gap-2">
                {['all', 'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded text-[11px] font-display uppercase tracking-wider ${
                        statusFilter === st
                          ? 'bg-[#FF3B1F] text-white font-bold'
                          : 'bg-[#171717] text-[#A3A3A3] hover:text-white border border-[#2A2A2A]'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  )
                )}
              </div>

              <input
                type="text"
                placeholder="Search by order #, customer, phone..."
                className="input sm:w-72 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="card p-12 text-center text-[#A3A3A3]">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="card p-12 text-center text-[#A3A3A3]">
                No orders match your filter criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="card p-5 border-l-4 border-l-[#FF3B1F]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#2A2A2A]">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-bold text-[#F59E0B]">
                            #{ord.order_number}
                          </span>
                          <span className="badge badge-dark text-[10px] uppercase font-bold">
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                          <span className="badge badge-red text-[10px] uppercase">
                            {ord.payment_method.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-body-sm text-[#D1D1D1]">
                          <strong className="text-white">{ord.delivery_address?.full_name}</strong>{' '}
                          · {ord.delivery_address?.phone} · {ord.delivery_address?.area},{' '}
                          {ord.delivery_address?.city}
                        </p>
                      </div>

                      <div className="text-right flex items-center md:flex-col justify-between md:items-end">
                        <span className="text-xl font-display font-bold text-[#34D399]">
                          {formatPrice(ord.total)}
                        </span>
                        <span className="text-[11px] text-[#737373]">
                          {formatDate(ord.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="mb-4 bg-[#141414] p-3 rounded text-body-sm divide-y divide-[#222]">
                        {ord.items.map((it) => (
                          <div key={it.id} className="py-1.5 flex justify-between">
                            <span>
                              <strong className="text-white">{it.quantity}×</strong> {it.product_name}
                              {it.special_instructions && (
                                <span className="text-[#F59E0B] ml-2 text-xs">
                                  ("{it.special_instructions}")
                                </span>
                              )}
                            </span>
                            <span className="text-[#A3A3A3] font-display">
                              {formatPrice(it.total_price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Pipeline Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-label-sm text-[#737373] uppercase mr-2">
                        ADVANCE STATUS:
                      </span>
                      {(['confirmed', 'preparing', 'out_for_delivery', 'delivered'] as OrderStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(ord.id, st)}
                            disabled={ord.status === st}
                            className={`px-3 py-1.5 rounded text-[11px] font-display font-bold uppercase tracking-wider transition-colors ${
                              ord.status === st
                                ? 'bg-[#2A2A2A] text-[#737373] cursor-not-allowed'
                                : 'bg-[#1C1B1B] hover:bg-[#FF3B1F] text-white'
                            }`}
                          >
                            Mark {st.replace(/_/g, ' ')}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-[#2A2A2A] bg-[#141414] text-label-sm text-[#737373] uppercase">
                    <th className="p-4">Item</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Badge</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#171717] transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.image_url || '/images/nashville-inferno.jpg'}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/images/nashville-inferno.jpg'
                          }}
                        />
                        <div>
                          <span className="font-bold text-white uppercase block">{p.name}</span>
                          <span className="text-xs text-[#737373] line-clamp-1">{p.description}</span>
                        </div>
                      </td>
                      <td className="p-4 font-display font-bold text-[#F59E0B]">
                        {formatPrice(p.price)}
                      </td>
                      <td className="p-4">
                        {p.badge ? (
                          <span className="badge badge-amber text-[9px]">{p.badge}</span>
                        ) : (
                          <span className="text-[#525252]">—</span>
                        )}
                      </td>
                      <td className="p-4 text-white font-bold">★ {p.rating}</td>
                      <td className="p-4">
                        <span
                          className={`badge text-[10px] ${
                            p.is_available ? 'badge-red' : 'badge-dark text-[#737373]'
                          }`}
                        >
                          {p.is_available ? 'AVAILABLE' : 'OFF-SLAB'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
