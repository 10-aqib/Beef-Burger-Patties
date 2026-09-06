import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts, useCategories } from '@/hooks/useProducts'
import ProductCard from '@/components/menu/ProductCard'
import ProductCardSkeleton from '@/components/menu/ProductCardSkeleton'

export default function MenuPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const { categories, loading: catLoading } = useCategories()
  const { products, loading: prodLoading } = useProducts(activeCategoryId)

  useEffect(() => {
    document.title = 'Menu | Beef Burger Patties'
  }, [])

  return (
    <main
      className="min-h-screen pt-20"
      style={{ background: '#080808' }}
    >
      {/* Page header */}
      <div
        className="py-14 text-center"
        style={{ borderBottom: '1px solid #1F1F1F', background: '#080808' }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#FF3B1F]" />
          <span
            className="font-display font-bold uppercase tracking-widest text-[#FF3B1F]"
            style={{ fontSize: '11px', letterSpacing: '0.1em' }}
          >
            SMASHED TO ORDER · ZERO FROZEN
          </span>
          <span className="w-2 h-2 rounded-full bg-[#FF3B1F]" />
        </div>
        <h1
          className="font-display font-bold text-white uppercase"
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            letterSpacing: '-0.04em',
            lineHeight: '1',
          }}
        >
          THE FULL LINEUP
        </h1>
        <p className="text-body-md text-[#A3A3A3] mt-4 max-w-xl mx-auto px-4">
          Every item is prepared fresh when you order. No heat lamps, no shortcuts.
        </p>
      </div>

      <div className="container-max py-10">
        {/* Category filter tabs */}
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-8"
          role="tablist"
          aria-label="Menu categories"
        >
          <button
            role="tab"
            aria-selected={activeCategoryId === null}
            className={`flex-shrink-0 px-4 py-2 rounded font-display font-bold uppercase tracking-wider transition-all ${
              activeCategoryId === null
                ? 'bg-[#FF3B1F] text-white'
                : 'bg-[#171717] border border-[#2A2A2A] text-[#A3A3A3] hover:text-white hover:border-[#383838]'
            }`}
            style={{ fontSize: '12px', letterSpacing: '0.06em' }}
            onClick={() => setActiveCategoryId(null)}
          >
            All Items
          </button>
          {catLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton flex-shrink-0 h-9 w-28 rounded" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategoryId === cat.id}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded font-display font-bold uppercase tracking-wider transition-all ${
                    activeCategoryId === cat.id
                      ? 'bg-[#FF3B1F] text-white'
                      : 'bg-[#171717] border border-[#2A2A2A] text-[#A3A3A3] hover:text-white hover:border-[#383838]'
                  }`}
                  style={{ fontSize: '12px', letterSpacing: '0.06em' }}
                  onClick={() => setActiveCategoryId(cat.id)}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
        </div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategoryId || 'all'}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {prodLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length === 0
              ? (
                <div className="col-span-full py-20 text-center text-[#737373]">
                  <p className="text-headline-md">No items in this category yet.</p>
                </div>
              )
              : products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
