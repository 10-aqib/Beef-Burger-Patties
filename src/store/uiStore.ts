import { create } from 'zustand'

// ─── UI Store ─────────────────────────────────────────────────
// Global UI state: modals, drawers, overlays

interface UIState {
  // Auth modal
  authModalOpen: boolean
  authModalTab: 'login' | 'signup'
  openAuthModal: (tab?: 'login' | 'signup') => void
  closeAuthModal: () => void

  // Product customizer modal
  customizerProductId: string | null
  openCustomizer: (productId: string) => void
  closeCustomizer: () => void

  // Mobile nav
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void

  // Search
  searchOpen: boolean
  searchQuery: string
  openSearch: () => void
  closeSearch: () => void
  setSearchQuery: (query: string) => void

  // Location selector
  selectedCity: string
  locationModalOpen: boolean
  setSelectedCity: (city: string) => void
  openLocationModal: () => void
  closeLocationModal: () => void

  // Order tracking modal
  trackingOrderId: string | null
  openOrderTracking: (orderId: string) => void
  closeOrderTracking: () => void

  // Review modal
  reviewModalProductId: string | null
  openReviewModal: (productId?: string) => void
  closeReviewModal: () => void
}

const initialCity = typeof window !== 'undefined'
  ? localStorage.getItem('paput-burger-city') || localStorage.getItem('beef-burger-city') || localStorage.getItem('smashd-city') || 'Islamabad'
  : 'Islamabad'

export const useUIStore = create<UIState>((set) => ({
  // Auth modal
  authModalOpen: false,
  authModalTab: 'login',
  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),

  // Customizer
  customizerProductId: null,
  openCustomizer: (productId) => set({ customizerProductId: productId }),
  closeCustomizer: () => set({ customizerProductId: null }),

  // Mobile nav
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),

  // Search
  searchOpen: false,
  searchQuery: '',
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false, searchQuery: '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Location selector
  selectedCity: initialCity,
  locationModalOpen: false,
  setSelectedCity: (city) => {
    localStorage.setItem('paput-burger-city', city)
    set({ selectedCity: city })
  },
  openLocationModal: () => set({ locationModalOpen: true }),
  closeLocationModal: () => set({ locationModalOpen: false }),

  // Order tracking
  trackingOrderId: null,
  openOrderTracking: (orderId) => set({ trackingOrderId: orderId }),
  closeOrderTracking: () => set({ trackingOrderId: null }),

  // Review modal
  reviewModalProductId: null,
  openReviewModal: (productId) => set({ reviewModalProductId: productId || null }),
  closeReviewModal: () => set({ reviewModalProductId: null }),
}))

