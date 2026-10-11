import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Info } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { formatPrice } from '@/utils'
import type { Product, ModifierOption, SelectedModifier } from '@/types'
import toast from 'react-hot-toast'

import { getProductById } from '@/services/productService'

export default function ProductCustomizer() {
  const { customizerProductId, closeCustomizer } = useUIStore()
  const { addItem } = useCartStore()
  const modalRef = useRef<HTMLDivElement>(null)

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([])
  const [instructions, setInstructions] = useState('')
  const [adding, setAdding] = useState(false)

  const isOpen = Boolean(customizerProductId)

  // ─── Load product ─────────────────────────────────────────
  useEffect(() => {
    if (!customizerProductId) {
      setProduct(null)
      setQuantity(1)
      setSelectedModifiers([])
      setInstructions('')
      return
    }

    // Load dynamic product from Supabase / service
    getProductById(customizerProductId).then((found) => {
      setProduct(found)
      setQuantity(1)
      if (found?.modifiers) {
        const initialModifiers: SelectedModifier[] = []
        found.modifiers.forEach((group) => {
          if (
            group.is_required &&
            group.min_selections === 1 &&
            group.max_selections === 1 &&
            group.options.length > 0
          ) {
            initialModifiers.push({
              group_id: group.id,
              group_name: group.name,
              option_id: group.options[0].id,
              option_name: group.options[0].name,
              price_adjustment: group.options[0].price_adjustment,
            })
          }
        })
        setSelectedModifiers(initialModifiers)
      } else {
        setSelectedModifiers([])
      }
    })
  }, [customizerProductId])

  // ─── Price calculation ────────────────────────────────────
  const unitPrice = useMemo(() => {
    if (!product) return 0
    const modifierTotal = selectedModifiers.reduce((sum, m) => sum + m.price_adjustment, 0)
    return product.price + modifierTotal
  }, [product, selectedModifiers])

  const totalPrice = unitPrice * quantity

  // ─── Modifier selection ───────────────────────────────────
  function toggleModifier(option: ModifierOption, groupId: string, groupName: string, maxSelections: number) {
    const existing = selectedModifiers.find((m) => m.option_id === option.id)

    if (existing) {
      // Deselect
      setSelectedModifiers((prev) => prev.filter((m) => m.option_id !== option.id))
    } else {
      const groupSelections = selectedModifiers.filter((m) => m.group_id === groupId)
      if (groupSelections.length >= maxSelections) {
        // Replace the first one in this group if max reached
        if (maxSelections === 1) {
          setSelectedModifiers((prev) => [
            ...prev.filter((m) => m.group_id !== groupId),
            {
              group_id: groupId,
              group_name: groupName,
              option_id: option.id,
              option_name: option.name,
              price_adjustment: option.price_adjustment,
            },
          ])
        } else {
          toast.error(`Maximum ${maxSelections} choices allowed for ${groupName}`)
        }
        return
      }
      setSelectedModifiers((prev) => [
        ...prev,
        {
          group_id: groupId,
          group_name: groupName,
          option_id: option.id,
          option_name: option.name,
          price_adjustment: option.price_adjustment,
        },
      ])
    }
  }

  // ─── Validation ───────────────────────────────────────────
  const missingGroups = useMemo(() => {
    if (!product?.modifiers) return []
    return product.modifiers.filter((group) => {
      if (!group.is_required) return false
      const groupSelections = selectedModifiers.filter((m) => m.group_id === group.id)
      return groupSelections.length < group.min_selections
    })
  }, [product, selectedModifiers])

  const isAvailable = product?.is_available !== false

  function isValid(): boolean {
    if (!product) return false
    if (!isAvailable) return false
    return missingGroups.length === 0
  }

  // ─── Add to cart ──────────────────────────────────────────
  async function handleAddToCart() {
    if (!product || !isValid()) return
    setAdding(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    addItem(product, quantity, selectedModifiers, instructions)
    toast.success(`${product.name} added to bag`, {
      icon: '🍔',
      style: {
        background: '#1F1F1F',
        color: '#FFFFFF',
        border: '1px solid #2A2A2A',
        fontFamily: 'Space Grotesk',
        fontWeight: 600,
        fontSize: '13px',
        letterSpacing: '0.04em',
      },
    })
    setAdding(false)
    closeCustomizer()
  }

  // Accessible overlay management
  useOverlayA11y({
    isOpen,
    onClose: closeCustomizer,
    containerRef: modalRef,
  })

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCustomizer}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] flex flex-col"
            style={{
              background: '#121212',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-48%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customizer-title"
          >
            {/* Header */}
            <div className="relative overflow-hidden" style={{ height: '200px', flexShrink: 0 }}>
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/nashville-inferno.jpg'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-[#171717]">
                  🍔
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(18,18,18,1) 0%, rgba(18,18,18,0.5) 50%, transparent 100%)',
                }}
              />
              <button
                onClick={closeCustomizer}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                aria-label="Close customizer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <h2
                  id="customizer-title"
                  className="font-display font-bold text-white uppercase"
                  style={{ fontSize: '18px', letterSpacing: '-0.02em' }}
                >
                  {product.name}
                </h2>
                <p className="text-body-sm text-[#A3A3A3] mt-0.5 line-clamp-1">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Modifier groups */}
              {product.modifiers?.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <h3
                      className="font-display font-bold text-white uppercase"
                      style={{ fontSize: '12px', letterSpacing: '0.08em' }}
                    >
                      {group.name}
                    </h3>
                    {group.is_required && (
                      <span className="badge badge-red text-[9px]">Required</span>
                    )}
                    {group.max_selections > 1 && (
                      <span className="text-body-sm text-[#737373]">
                        (up to {group.max_selections})
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = selectedModifiers.some((m) => m.option_id === option.id)
                      return (
                        <button
                          key={option.id}
                          className={`modifier-chip w-full text-left ${isSelected ? 'selected' : ''} ${
                            !option.is_available ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => {
                            if (!option.is_available) return
                            toggleModifier(option, group.id, group.name, group.max_selections)
                          }}
                          disabled={!option.is_available}
                          aria-pressed={isSelected}
                        >
                          <span
                            className={`chip-dot ${isSelected ? 'bg-[#FF3B1F]' : 'bg-[#383838]'}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-display font-bold uppercase ${
                                  isSelected ? 'text-white' : 'text-[#A3A3A3]'
                                }`}
                                style={{ fontSize: '12px', letterSpacing: '0.04em' }}
                              >
                                {option.name}
                              </span>
                              {option.price_adjustment > 0 && (
                                <span
                                  className={`font-display font-bold ${
                                    isSelected ? 'text-[#F59E0B]' : 'text-[#737373]'
                                  }`}
                                  style={{ fontSize: '12px' }}
                                >
                                  +{formatPrice(option.price_adjustment)}
                                </span>
                              )}
                              {option.price_adjustment === 0 && (
                                <span className="text-[#737373] text-body-sm" style={{ fontSize: '11px' }}>
                                  Included
                                </span>
                              )}
                            </div>
                            {option.description && (
                              <p className="text-[#737373] mt-0.5" style={{ fontSize: '11px' }}>
                                {option.description}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Special instructions */}
              <div>
                <label
                  htmlFor="instructions"
                  className="font-display font-bold text-white uppercase mb-2 block"
                  style={{ fontSize: '12px', letterSpacing: '0.08em' }}
                >
                  Special Instructions
                </label>
                <textarea
                  id="instructions"
                  className="input resize-none"
                  rows={2}
                  placeholder="Any allergies or special requests..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  maxLength={200}
                />
              </div>
            </div>

            {/* ─── Sticky Bottom Bar ──────────────────────────── */}
            <div
              className="p-4 flex-shrink-0"
              style={{ borderTop: '1px solid #2A2A2A', background: '#0D0D0D' }}
            >
              {/* Price breakdown */}
              <div className="flex items-center justify-between mb-3 text-body-sm text-[#A3A3A3]">
                <span>Base price</span>
                <span className="text-white font-semibold">{formatPrice(product.price)}</span>
              </div>
              {selectedModifiers.filter((m) => m.price_adjustment > 0).map((m) => (
                <div key={m.option_id} className="flex items-center justify-between mb-1.5 text-body-sm text-[#A3A3A3]">
                  <span>{m.option_name}</span>
                  <span className="text-[#F59E0B]">+{formatPrice(m.price_adjustment)}</span>
                </div>
              ))}
              <div
                className="flex items-center justify-between pt-2 mt-2"
                style={{ borderTop: '1px solid #2A2A2A' }}
              >
                <div>
                  <div className="text-body-sm text-[#A3A3A3] uppercase tracking-widest" style={{ fontSize: '10px' }}>
                    Total
                  </div>
                  <div
                    className="font-display font-bold text-[#F59E0B]"
                    style={{ fontSize: '24px', letterSpacing: '-0.02em' }}
                  >
                    {formatPrice(totalPrice)}
                  </div>
                </div>

                {/* Quantity + Add */}
                <div className="flex items-center gap-2">
                  {/* Quantity selector */}
                  <div
                    className="flex items-center gap-1 rounded"
                    style={{ background: '#1F1F1F', border: '1px solid #2A2A2A' }}
                  >
                    <button
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-[#FF3B1F] transition-colors"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className="font-display font-bold text-white w-6 text-center"
                      style={{ fontSize: '14px' }}
                      aria-label={`Quantity: ${quantity}`}
                    >
                      {quantity}
                    </span>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-[#FF3B1F] transition-colors"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add button */}
                  <motion.button
                    className="btn-primary flex items-center gap-2 px-5 py-2.5"
                    onClick={handleAddToCart}
                    disabled={adding || !isValid()}
                    whileTap={isValid() ? { scale: 0.97 } : {}}
                    style={{
                      opacity: !isValid() ? 0.5 : 1,
                      cursor: !isValid() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {adding ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : !isAvailable ? (
                      <span>UNAVAILABLE</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {!isAvailable ? (
                <p className="text-[#FF3B1F] text-body-sm mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  This item is currently sold out and unavailable to order.
                </p>
              ) : missingGroups.length > 0 ? (
                <p className="text-[#FF3B1F] text-body-sm mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Please select: {missingGroups.map((g) => g.name).join(', ')}
                </p>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
