import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartSummary, Product, SelectedModifier } from '@/types'
import { generateId } from '@/utils'

// ─── Constants ────────────────────────────────────────────────
const DELIVERY_FEE_BASE = 150
const FREE_DELIVERY_THRESHOLD = 2000

// ─── Cart State ───────────────────────────────────────────────
interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (
    product: Product,
    quantity: number,
    selectedModifiers: SelectedModifier[],
    specialInstructions: string
  ) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Computed
  getSummary: () => CartSummary
  getItemCount: () => number
}

// ─── Price Calculation ────────────────────────────────────────
function calcUnitPrice(product: Product, modifiers: SelectedModifier[]): number {
  const modifierTotal = modifiers.reduce((sum, m) => sum + m.price_adjustment, 0)
  return product.price + modifierTotal
}

// ─── Store ────────────────────────────────────────────────────
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity, selectedModifiers, specialInstructions) => {
        const unitPrice = calcUnitPrice(product, selectedModifiers)
        const totalPrice = unitPrice * quantity

        // Check if same product + same modifiers already in cart
        const existing = get().items.find(
          (item) =>
            item.product.id === product.id &&
            JSON.stringify(item.selected_modifiers) === JSON.stringify(selectedModifiers) &&
            item.special_instructions === specialInstructions
        )

        if (existing) {
          // Increase quantity
          set((state) => ({
            items: state.items.map((item) =>
              item.id === existing.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    total_price: (item.quantity + quantity) * item.unit_price,
                  }
                : item
            ),
          }))
        } else {
          const newItem: CartItem = {
            id: generateId(),
            product,
            quantity,
            selected_modifiers: selectedModifiers,
            unit_price: unitPrice,
            total_price: totalPrice,
            special_instructions: specialInstructions,
          }
          set((state) => ({ items: [...state.items, newItem] }))
        }
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }))
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity, total_price: quantity * item.unit_price }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getSummary: (): CartSummary => {
        const items = get().items
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
        const delivery_fee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_BASE
        const discount = 0 // Applied from coupon
        const total = subtotal + delivery_fee - discount
        const item_count = items.reduce((sum, item) => sum + item.quantity, 0)
        return { subtotal, delivery_fee, discount, total, item_count }
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'paput-burger-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items — not UI state
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state && state.items.length === 0 && typeof window !== 'undefined') {
          try {
            const legacy = localStorage.getItem('beef-burger-cart') || localStorage.getItem('smashd-cart')
            if (legacy) {
              const parsed = JSON.parse(legacy)
              if (parsed.state?.items?.length) {
                state.items = parsed.state.items
              }
            }
          } catch (_) {}
        }
      },
    }
  )
)

// ─── Selector Hooks ───────────────────────────────────────────
export const FREE_DELIVERY_AMOUNT = FREE_DELIVERY_THRESHOLD
export const DELIVERY_FEE = DELIVERY_FEE_BASE
