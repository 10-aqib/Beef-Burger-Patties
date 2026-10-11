import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore, FREE_DELIVERY_AMOUNT } from '@/store/cartStore'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { formatPrice } from '@/utils'
import type { CartItem } from '@/types'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSummary } = useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)
  const summary = getSummary()
  const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_AMOUNT - summary.subtotal)
  const freeDeliveryProgress = Math.min(100, (summary.subtotal / FREE_DELIVERY_AMOUNT) * 100)

  // Accessible overlay management (scroll lock, escape stack, focus trap & restoration)
  useOverlayA11y({
    isOpen,
    onClose: closeCart,
    containerRef: drawerRef,
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            className="cart-drawer z-[80]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* ─── Cart Header ─────────────────────────────── */}
            <div
              className="flex items-center justify-between p-4 flex-shrink-0"
              style={{ borderBottom: '1px solid #2A2A2A' }}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#FF3B1F]" />
                <h2
                  className="font-display font-bold text-white uppercase"
                  style={{ fontSize: '14px', letterSpacing: '0.08em' }}
                >
                  YOUR BAG
                </h2>
                {items.length > 0 && (
                  <span
                    className="w-5 h-5 rounded-full bg-[#FF3B1F] flex items-center justify-center font-bold text-white"
                    style={{ fontSize: '10px' }}
                    aria-label={`${summary.item_count} items`}
                  >
                    {summary.item_count}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ─── Free Delivery Progress ───────────────────── */}
            {summary.subtotal > 0 && (
              <div
                className="px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid #2A2A2A', background: '#0D0D0D' }}
              >
                {freeDeliveryRemaining > 0 ? (
                  <>
                    <p className="text-body-sm text-[#A3A3A3] mb-2">
                      Add{' '}
                      <span className="text-[#F59E0B] font-semibold">
                        {formatPrice(freeDeliveryRemaining)}
                      </span>{' '}
                      more for{' '}
                      <span className="text-white font-semibold">Free Priority Delivery</span>
                    </p>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#2A2A2A' }}>
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF3B1F] to-[#F59E0B]"
                        initial={{ width: 0 }}
                        animate={{ width: `${freeDeliveryProgress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-body-sm text-[#F59E0B] font-semibold">
                      You've unlocked Free Priority Delivery! 🎉
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ─── Cart Items ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {items.length === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <div className="p-4 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ─── Cart Footer ──────────────────────────────── */}
            {items.length > 0 && (
              <div
                className="p-4 flex-shrink-0 space-y-3"
                style={{ borderTop: '1px solid #2A2A2A', background: '#0D0D0D' }}
              >
                {/* Price summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-body-sm text-[#A3A3A3]">
                    <span>Subtotal ({summary.item_count} items)</span>
                    <span className="text-white">{formatPrice(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-[#A3A3A3]">
                    <span>Delivery</span>
                    <span className={summary.delivery_fee === 0 ? 'text-[#F59E0B] font-semibold' : 'text-white'}>
                      {summary.delivery_fee === 0 ? 'FREE' : formatPrice(summary.delivery_fee)}
                    </span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-body-sm text-[#A3A3A3]">
                      <span>Discount</span>
                      <span className="text-[#F59E0B]">-{formatPrice(summary.discount)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between pt-2"
                    style={{ borderTop: '1px solid #2A2A2A' }}
                  >
                    <span
                      className="font-display font-bold text-white uppercase"
                      style={{ fontSize: '13px', letterSpacing: '0.06em' }}
                    >
                      Total
                    </span>
                    <span
                      className="font-display font-bold text-[#F59E0B]"
                      style={{ fontSize: '20px', letterSpacing: '-0.02em' }}
                    >
                      {formatPrice(summary.total)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  to="/checkout"
                  className="btn-primary w-full text-label-lg py-3.5 justify-center shadow-[0_0_24px_-4px_rgba(255,59,31,0.5)]"
                  onClick={closeCart}
                >
                  CHECKOUT <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full text-body-sm text-[#737373] hover:text-[#A3A3A3] transition-colors text-center"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <motion.div
        className="text-6xl mb-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-hidden="true"
      >
        🍔
      </motion.div>
      <h3
        className="font-display font-bold text-white uppercase mb-2"
        style={{ fontSize: '16px', letterSpacing: '-0.01em' }}
      >
        Your Bag is Empty
      </h3>
      <p className="text-body-sm text-[#A3A3A3] mb-6">
        Time to fill it up with something delicious.
      </p>
      <Link
        to="/menu"
        onClick={onClose}
        className="btn-primary text-label-md px-6 py-2.5"
      >
        BROWSE MENU
      </Link>
    </div>
  )
}

// ─── Cart Item Row ────────────────────────────────────────────
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem
  onUpdateQuantity: (qty: number) => void
  onRemove: () => void
}) {
  return (
    <motion.div
      className="flex gap-3 p-3 rounded"
      style={{ background: '#171717', border: '1px solid #2A2A2A' }}
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, padding: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-[#1F1F1F]">
            🍔
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4
          className="font-display font-bold text-white uppercase truncate"
          style={{ fontSize: '12px', letterSpacing: '0.02em' }}
        >
          {item.product.name}
        </h4>

        {/* Modifiers */}
        {item.selected_modifiers.length > 0 && (
          <p className="text-[#737373] mt-0.5" style={{ fontSize: '10px', lineHeight: '14px' }}>
            {item.selected_modifiers.map((m) => m.option_name).join(', ')}
          </p>
        )}

        {/* Price */}
        <div
          className="font-display font-bold text-[#F59E0B] mt-1"
          style={{ fontSize: '14px' }}
        >
          {formatPrice(item.total_price)}
        </div>
      </div>

      {/* Quantity + Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={onRemove}
          className="text-[#737373] hover:text-[#FF3B1F] transition-colors"
          aria-label={`Remove ${item.product.name}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div
          className="flex items-center gap-1 rounded"
          style={{ background: '#1F1F1F', border: '1px solid #383838' }}
        >
          <button
            className="w-6 h-6 flex items-center justify-center text-[#A3A3A3] hover:text-[#FF3B1F] transition-colors"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span
            className="font-display font-bold text-white w-4 text-center"
            style={{ fontSize: '12px' }}
          >
            {item.quantity}
          </span>
          <button
            className="w-6 h-6 flex items-center justify-center text-[#A3A3A3] hover:text-[#FF3B1F] transition-colors"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
