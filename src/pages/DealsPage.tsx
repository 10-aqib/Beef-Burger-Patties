import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, ShoppingBag } from 'lucide-react'
import { getDeals } from '@/services/productService'
import { formatPrice } from '@/utils'
import { useCartStore } from '@/store/cartStore'
import type { Deal, Product } from '@/types'
import toast from 'react-hot-toast'

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Deals | Paput Burgers'
    getDeals().then((data) => {
      setDeals(data)
      setLoading(false)
    })
  }, [])

  function handleClaimDeal(deal: Deal) {
    // Treat deal as product for cart
    const dealProduct: Product = {
      id: deal.id,
      category_id: 'deals',
      name: deal.name,
      slug: deal.slug,
      description: deal.items_description || deal.description,
      price: deal.price,
      image_url: deal.image_url,
      is_available: true,
      is_featured: true,
      is_spicy: false,
      is_bestseller: true,
      rating: 5.0,
      rating_count: 120,
      badge: deal.badge || 'DEAL',
      sort_order: deal.sort_order,
      created_at: deal.created_at,
      updated_at: deal.created_at,
    }

    addItem(dealProduct, 1, [], 'Special deal bundle')
    toast.success(`${deal.name} added to your bag!`, {
      icon: '🔥',
    })
  }

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(255, 59, 31, 0.1)', border: '1px solid rgba(255, 59, 31, 0.3)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tag className="w-3.5 h-3.5 text-[#FF3B1F]" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#FF3B1F]">
              LIMITED TIME FORGE OFFERS
            </span>
          </motion.div>

          <motion.h1
            className="text-display-hero-mobile sm:text-headline-lg font-display font-bold text-white uppercase tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            SAVINGS MADE TO <span className="text-[#FF3B1F]">CRAVE.</span>
          </motion.h1>

          <motion.p
            className="text-body-md text-[#A3A3A3]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Signature combos, family feasts, and high-heat bundles. Handcrafted fresh with 100% Halal Angus beef and crispy Nashville cuts.
          </motion.p>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-96 animate-pulse bg-[#171717]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {deals.map((deal, idx) => (
              <motion.div
                key={deal.id}
                className="card overflow-hidden flex flex-col justify-between group hover:border-[#FF3B1F] transition-all duration-300 h-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#121212]">
                  <img
                    src={deal.image_url || '/images/family-feast.jpg'}
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/images/family-feast.jpg'
                    }}
                  />
                  {deal.badge && (
                    <span className="absolute top-3 left-3 badge badge-red text-xs">
                      {deal.badge}
                    </span>
                  )}
                  {deal.discount_percentage > 0 && (
                    <span className="absolute top-3 right-3 badge badge-amber text-xs">
                      {deal.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <h2 className="text-headline-sm text-white uppercase font-display font-bold">
                        {deal.name}
                      </h2>
                    </div>
                    <p className="text-body-sm text-[#A3A3A3] mb-4 line-clamp-2">
                      {deal.description}
                    </p>

                    {deal.items_description && (
                      <div className="p-3 rounded bg-[#171717] border border-[#2A2A2A] text-body-sm text-[#D1D1D1] mb-2">
                        <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block mb-1">
                          WHAT'S INCLUDED:
                        </span>
                        {deal.items_description}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#2A2A2A] flex items-center justify-between">
                    <div>
                      {deal.original_price > deal.price && (
                        <span className="text-body-sm text-[#737373] line-through block">
                          {formatPrice(deal.original_price)}
                        </span>
                      )}
                      <span className="font-display font-bold text-[#F59E0B] text-xl">
                        {formatPrice(deal.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleClaimDeal(deal)}
                      className="btn-primary text-label-sm px-4 py-2.5 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      CLAIM DEAL
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
