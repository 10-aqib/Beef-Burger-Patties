import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useFeaturedProducts } from '@/hooks/useProducts'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

export default function FeaturedProducts() {
  const headingRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headingRef, { once: true, margin: '-80px' })

  const { products, loading, error } = useFeaturedProducts()

  return (
    <section
      id="featured-menu"
      className="w-full section-padding"
      style={{ background: '#080808' }}
      aria-labelledby="featured-heading"
    >
      <div className="container-max">
        {/* ─── Section Header ───────────────────────────── */}
        <div ref={headingRef} className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <motion.div
              className="flex items-center gap-2 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span
                className="font-display font-bold uppercase tracking-widest text-[#F59E0B]"
                style={{ fontSize: '11px', letterSpacing: '0.1em' }}
              >
                CURATED DAILY LINEUP
              </span>
            </motion.div>
            <motion.h2
              id="featured-heading"
              className="text-headline-lg text-white uppercase leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              THE ONES EVERYONE'S
              <br />
              TALKING ABOUT
            </motion.h2>
          </div>

          <motion.div
            className="max-w-lg w-full"
            style={{ maxWidth: '520px', width: '100%' }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-body-md text-[#A3A3A3] mb-4 text-base leading-relaxed">
              Every order is smashed raw-to-order on searing steel. No warmers.
              No frozen pre-formed meat. Pure sizzle geometry.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-label-md text-[#FF3B1F] hover:text-[#FF543B] transition-colors font-bold uppercase tracking-wider"
            >
              VIEW FULL MENU <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* ─── Error State ──────────────────────────────── */}
        {error && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-4"
            role="alert"
          >
            <span className="text-headline-md text-[#A3A3A3]">⚠️</span>
            <p className="text-body-md text-[#A3A3A3]">{error}</p>
            <button
              className="btn-secondary text-label-md px-6 py-2.5"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* ─── Product Grid ─────────────────────────────── */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
          </div>
        )}
      </div>
    </section>
  )
}
