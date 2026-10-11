import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ShoppingBag } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { getProducts } from '@/services/productService'
import { formatPrice } from '@/utils'
import type { Product } from '@/types'

export default function SearchModal() {
  const { searchOpen, closeSearch, openCustomizer } = useUIStore()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen) {
      setLoading(true)
      getProducts().then((data) => {
        setProducts(data)
        setLoading(false)
      })
    } else {
      setQuery('')
    }
  }, [searchOpen])

  useOverlayA11y({
    isOpen: searchOpen,
    onClose: closeSearch,
    containerRef: modalRef,
    initialFocusRef: inputRef,
  })

  const filtered = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q)
        )
      })
    : products.slice(0, 4) // Show recommendations initially

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Search menu items"
            className="fixed top-16 sm:top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[80]"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="card overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              style={{ background: '#121212', border: '1px solid #2A2A2A' }}
            >
              {/* Input row */}
              <div className="flex items-center gap-3 p-4 border-b border-[#2A2A2A]">
                <Search className="w-5 h-5 text-[#FF3B1F] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search craft burgers, fiery chicken, loaded fries, sauces..."
                  className="w-full bg-transparent text-white font-display text-base sm:text-lg placeholder:text-[#525252] focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-[#737373] hover:text-white p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={closeSearch}
                  className="btn-secondary text-xs px-2.5 py-1.5 shrink-0"
                >
                  ESC
                </button>
              </div>

              {/* Quick tags */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#171717] border-b border-[#2A2A2A] text-xs overflow-x-auto">
                <span className="text-[#737373] uppercase text-[10px] font-bold tracking-wider">
                  QUICK:
                </span>
                {['Double Smash', 'Nashville', 'Bacon', 'Fries', 'Spicy'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-0.5 rounded-full bg-[#202020] text-[#A3A3A3] hover:text-white hover:bg-[#FF3B1F] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="py-12 text-center text-[#737373]">Searching forge inventory...</div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-white font-display font-bold uppercase mb-1">
                      NO SMASH MATCH FOR "{query}"
                    </p>
                    <p className="text-body-sm text-[#737373]">
                      Try searching for "OG Double", "Nashville", or "Loaded Fries".
                    </p>
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block mb-2">
                      {query ? `RESULTS (${filtered.length})` : 'TRENDING ITEMS'}
                    </span>
                    <div className="space-y-2">
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#171717] hover:bg-[#1F1F1F] border border-[#262626] transition-colors gap-3"
                        >
                          <img
                            src={item.image_url || '/images/nashville-inferno.jpg'}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = '/images/nashville-inferno.jpg'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-display font-bold text-sm uppercase truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-[#737373] truncate">{item.description}</p>
                            <span className="text-xs font-display font-bold text-[#F59E0B]">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              closeSearch()
                              openCustomizer(item.id)
                            }}
                            className="btn-primary text-xs px-3 py-1.5 shrink-0 flex items-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            ORDER
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
