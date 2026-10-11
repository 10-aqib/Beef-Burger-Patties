import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShoppingCart, Star, Flame, Zap } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { formatPrice } from '@/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  index?: number
}

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  BESTSELLER: { bg: '#FF3B1F', text: '#FFFFFF' },
  'SPICY HEAT': { bg: '#F59E0B', text: '#1A0F00' },
  HEAVYWEIGHT: { bg: '#353534', text: '#FFFFFF' },
  CRAVINGS: { bg: '#353534', text: '#F59E0B' },
  PREMIUM: { bg: '#1F1F1F', text: '#F59E0B' },
  DEFAULT: { bg: '#2A2A2A', text: '#A3A3A3' },
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef, { once: true, margin: '-50px' })

  const { addItem } = useCartStore()
  const { openCustomizer } = useUIStore()

  const isAvailable = product.is_available !== false

  const hasModifiers =
    product.modifiers && product.modifiers.length > 0 &&
    product.modifiers.some((g) => g.options.length > 0)

  const badgeStyle = !isAvailable
    ? { bg: '#262626', text: '#A3A3A3' }
    : product.badge
    ? (BADGE_STYLES[product.badge] || BADGE_STYLES.DEFAULT)
    : null

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isAvailable) return

    if (hasModifiers) {
      openCustomizer(product.id)
      return
    }

    // Direct add (no modifiers)
    addItem(product, 1, [], '')
    toast.success(`${product.name} added to bag`, {
      icon: '🍔',
      style: {
        background: '#1F1F1F',
        color: '#FFFFFF',
        border: '1px solid #2A2A2A',
        fontFamily: 'Space Grotesk',
        fontWeight: 600,
        letterSpacing: '0.04em',
        fontSize: '13px',
      },
    })
  }

  function handleCardClick() {
    if (!isAvailable) return
    openCustomizer(product.id)
  }

  return (
    <motion.div
      ref={cardRef}
      className={`product-card group flex flex-col ${
        isAvailable ? 'cursor-pointer' : 'opacity-70 cursor-not-allowed'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={handleCardClick}
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      aria-disabled={!isAvailable}
      onKeyDown={(e) => isAvailable && e.key === 'Enter' && handleCardClick()}
      aria-label={`${product.name} — ${formatPrice(product.price)}${!isAvailable ? ' (Sold Out)' : ''}`}
    >
      {/* ─── Image ─────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/images/nashville-inferno.jpg'
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-6xl"
            style={{ background: '#171717' }}
          >
            🍔
          </div>
        )}

        {/* Gradient overlay on image */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.6) 0%, transparent 60%)' }}
        />

        {/* Badge */}
        {!isAvailable ? (
          <div
            className="absolute top-3 left-3 badge font-display font-bold uppercase tracking-wider"
            style={{ background: '#262626', color: '#D4D4D4', border: '1px solid #404040' }}
          >
            SOLD OUT
          </div>
        ) : badgeStyle && product.badge ? (
          <div
            className="absolute top-3 left-3 badge"
            style={{ background: badgeStyle.bg, color: badgeStyle.text }}
          >
            {product.badge}
          </div>
        ) : null}

        {/* Spicy indicator */}
        {product.is_spicy && (
          <div className="absolute top-3 right-14 flex items-center gap-1">
            <Flame className="w-4 h-4 text-[#FF3B1F]" />
          </div>
        )}

        {/* Price */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded text-headline-sm font-bold"
          style={{
            background: 'rgba(14,14,14,0.92)',
            border: '1px solid #383838',
            backdropFilter: 'blur(8px)',
            color: '#F59E0B',
            fontFamily: 'Space Grotesk',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          {formatPrice(product.price)}
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        <div className="flex-1 flex flex-col justify-start">
          {/* Name + Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="font-display font-bold text-white uppercase leading-snug text-sm sm:text-base"
              style={{ letterSpacing: '-0.01em' }}
            >
              {product.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-body-sm text-[#F59E0B] font-bold text-xs sm:text-[13px]">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-body-sm text-[#A3A3A3] line-clamp-2 text-xs sm:text-[13px] leading-relaxed"
          >
            {product.description}
          </p>
        </div>

        {/* Add to Cart */}
        <motion.button
          className={`mt-auto w-full py-3 px-4 rounded flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider text-white transition-all duration-200 shadow-sm ${
            !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            background: isAvailable ? '#2A2A2A' : '#1A1A1A',
            fontSize: '11px',
            letterSpacing: '0.08em',
          }}
          whileHover={
            isAvailable
              ? {
                  background: '#FF3B1F',
                  scale: 1.01,
                }
              : {}
          }
          whileTap={isAvailable ? { scale: 0.98 } : {}}
          onClick={handleAddToCart}
          disabled={!isAvailable}
          aria-label={isAvailable ? `Add ${product.name} to cart` : `${product.name} is sold out`}
        >
          {isAvailable ? (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{hasModifiers ? 'CUSTOMIZE & ADD' : 'ADD TO CART'}</span>
              {hasModifiers && <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />}
            </>
          ) : (
            <span>OUT OF STOCK</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
