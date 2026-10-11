import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, MapPin, Search, User, Menu, X, ChevronDown, Flame, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { formatPrice } from '@/utils'

// ─── Real Nav Links ──────────────────────────────────────────
const NAV_LINKS = [
  { label: 'HOME', path: '/' },
  { label: 'MENU', path: '/menu' },
  { label: 'DEALS', path: '/deals' },
  { label: 'ABOUT', path: '/about' },
  { label: 'LOCATIONS', path: '/locations' },
  { label: 'CONTACT', path: '/contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const mobileNavRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const { items, toggleCart, getSummary } = useCartStore()
  const {
    openAuthModal,
    mobileNavOpen,
    closeMobileNav,
    toggleMobileNav,
    openSearch,
    openLocationModal,
    selectedCity,
  } = useUIStore()
  const { user, profile } = useAuth()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const summary = getSummary()

  // ─── Scroll Handler ──────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ─── Close mobile nav on route change ─────────────────────
  useEffect(() => {
    closeMobileNav()
  }, [location.pathname, closeMobileNav])

  // ─── Accessible Overlay Management (ESC stack, scroll lock, focus trap)
  useOverlayA11y({
    isOpen: mobileNavOpen,
    onClose: closeMobileNav,
    containerRef: mobileNavRef,
  })

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* ─── Main Header ─────────────────────────────────── */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'glass shadow-[0_4px_24px_rgba(0,0,0,0.7)] py-0'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-1'
        }`}
        style={{ willChange: 'background-color, backdrop-filter' }}
      >
        <div className="container-max h-20 flex items-center justify-between gap-3">
          {/* ─── Left: Logo & Location Selector ─────────────── */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 group"
              aria-label="Paput Burgers Home"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#FF3B1F] opacity-15 group-hover:opacity-30 transition-opacity" />
                  <Flame className="w-6 h-6 text-[#FF3B1F]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="font-display font-black text-white uppercase tracking-tight text-sm sm:text-base md:text-[17px]"
                  style={{ letterSpacing: '-0.02em', lineHeight: 1.05 }}
                >
                  PAPUT
                </span>
                <span className="font-display text-[9px] font-bold tracking-[0.16em] text-[#FF3B1F] uppercase mt-0.5">
                  BURGERS · PAKISTAN
                </span>
              </div>
            </Link>

            {/* Location Selector Button */}
            <button
              onClick={openLocationModal}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] border border-[#262626] text-white transition-colors"
              aria-label={`Selected city: ${selectedCity}. Click to change location`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF3B1F] shrink-0" />
              <span className="text-label-sm uppercase font-display font-bold tracking-wider text-xs">
                {selectedCity}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
            </button>
          </div>

          {/* ─── Center: Desktop Nav ───────────────────────── */}
          <nav
            className="hidden xl:flex items-center justify-center flex-1 mx-4 gap-2"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`px-3.5 py-2 text-label-md uppercase font-display tracking-wider transition-colors duration-150 rounded ${
                  isActive(link.path)
                    ? 'text-white bg-[#1F1F1F] font-bold shadow-sm'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#141414]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ─── Right Actions ─────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Kitchen / Tracking Button */}
            <Link
              to="/order-tracking"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1B1B] hover:bg-[#222] border border-[#2A2A2A] transition-colors"
              aria-label="Live kitchen status and tracking"
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-label-sm text-[#F59E0B] uppercase tracking-wider font-display font-bold text-[10px]">
                LIVE RADAR
              </span>
            </Link>

            {/* Search */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1C1B1B] text-[#A3A3A3] hover:text-white hover:bg-[#201F1F] border border-[#2A2A2A] transition-colors"
              onClick={openSearch}
              aria-label="Search menu"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1C1B1B] hover:bg-[#201F1F] border border-[#2A2A2A] transition-colors"
              onClick={toggleCart}
              aria-label={`Cart — ${itemCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-[#FF3B1F]" />
              {itemCount > 0 && (
                <>
                  <div className="flex items-center gap-1 font-display">
                    <span className="text-label-md text-[#FF3B1F] font-bold">[{itemCount}]</span>
                    <span className="hidden md:inline text-label-md text-[#F59E0B] font-bold">
                      {formatPrice(summary.total)}
                    </span>
                  </div>
                  {/* Animated badge bump */}
                  <motion.span
                    key={itemCount}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF3B1F] flex items-center justify-center text-[9px] font-bold text-white shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {itemCount}
                  </motion.span>
                </>
              )}
            </button>

            {/* User Profile */}
            {user ? (
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C1B1B] hover:bg-[#201F1F] border border-[#2A2A2A] transition-colors"
                aria-label="User profile"
              >
                <div className="w-5 h-5 rounded-full bg-[#FF3B1F] flex items-center justify-center text-[10px] font-bold text-white">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-label-sm text-white uppercase font-display font-bold text-xs">
                  {profile?.full_name?.split(' ')[0] || 'Profile'}
                </span>
              </Link>
            ) : (
              <button
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1C1B1B] hover:bg-[#201F1F] text-[#A3A3A3] hover:text-white border border-[#2A2A2A] transition-colors"
                onClick={() => openAuthModal('login')}
              >
                <User className="w-4 h-4" />
                <span className="text-label-sm uppercase font-display tracking-wider text-xs">Sign In</span>
              </button>
            )}

            {/* Admin link shortcut */}
            <Link
              to="/admin"
              className="hidden xl:flex items-center justify-center w-8 h-8 rounded bg-[#141414] hover:bg-[#1F1F1F] text-[#737373] hover:text-white border border-[#262626] transition-colors"
              title="Kitchen Admin Dashboard"
              aria-label="Admin Dashboard"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </Link>

            {/* ORDER NOW CTA */}
            <Link
              to="/menu"
              className="hidden lg:inline-flex btn-primary text-label-md px-4 py-2.5 shadow-[0_0_24px_-4px_rgba(255,59,31,0.45)]"
            >
              ORDER NOW
            </Link>

            {/* Mobile hamburger */}
            <button
              className="xl:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#1C1B1B] text-[#A3A3A3] hover:text-white border border-[#2A2A2A] transition-colors"
              onClick={toggleMobileNav}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Navigation Panel ──────────────────────── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileNav}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              ref={mobileNavRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed top-0 left-0 h-full w-[320px] max-w-[90vw] z-[70] xl:hidden flex flex-col shadow-2xl"
              style={{ background: '#080808', borderRight: '1px solid #2A2A2A' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Mobile nav header */}
              <div className="flex items-center justify-between p-5 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-[#FF3B1F]" />
                  <div className="flex flex-col leading-none">
                    <span className="font-display font-black text-white text-base uppercase tracking-tight">
                      PAPUT
                    </span>
                    <span className="font-display text-[8.5px] font-bold text-[#FF3B1F] tracking-[0.14em] uppercase mt-0.5">
                      BURGERS · PAKISTAN
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeMobileNav}
                  className="w-8 h-8 flex items-center justify-center rounded text-[#A3A3A3] hover:text-white hover:bg-[#1C1B1B] transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* City selector on mobile */}
              <div className="p-4 border-b border-[#2A2A2A] bg-[#0E0E0E]">
                <button
                  onClick={() => {
                    closeMobileNav()
                    openLocationModal()
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded bg-[#171717] border border-[#2A2A2A] text-left"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF3B1F]" />
                    <span className="text-xs font-display font-bold text-white uppercase">
                      Location: {selectedCity}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile navigation">
                <div className="space-y-1">
                  {NAV_LINKS.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.04, duration: 0.25 }}
                    >
                      <Link
                        to={link.path}
                        onClick={closeMobileNav}
                        className={`flex items-center px-4 py-3 rounded text-label-md uppercase font-display tracking-wider transition-colors ${
                          isActive(link.path)
                            ? 'text-[#FF3B1F] bg-[rgba(255,59,31,0.08)] border-l-2 border-[#FF3B1F] font-bold'
                            : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Tracking link */}
                  <Link
                    to="/order-tracking"
                    onClick={closeMobileNav}
                    className="flex items-center px-4 py-3 rounded text-label-md uppercase font-display tracking-wider text-[#F59E0B] hover:bg-[#171717]"
                  >
                    LIVE ORDER RADAR
                  </Link>

                  {/* Admin link */}
                  <Link
                    to="/admin"
                    onClick={closeMobileNav}
                    className="flex items-center px-4 py-3 rounded text-label-md uppercase font-display tracking-wider text-[#737373] hover:text-white hover:bg-[#171717]"
                  >
                    KITCHEN ADMIN
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-[#2A2A2A] space-y-3">
                  {user ? (
                    <Link
                      to="/profile"
                      onClick={closeMobileNav}
                      className="flex items-center gap-3 px-4 py-3 rounded bg-[#171717] text-white"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FF3B1F] flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-label-sm text-white uppercase tracking-wider font-display">
                          {profile?.full_name || 'My Profile'}
                        </div>
                        <div className="text-body-sm text-[#A3A3A3]">{user.email}</div>
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => { closeMobileNav(); openAuthModal('login') }}
                      className="w-full btn-secondary text-label-md py-3 font-display"
                    >
                      SIGN IN
                    </button>
                  )}
                  <Link
                    to="/menu"
                    onClick={closeMobileNav}
                    className="block w-full btn-primary text-label-md py-3 text-center font-display"
                  >
                    ORDER NOW
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-[#2A2A2A]">
                <div className="flex items-center gap-2 text-body-sm text-[#737373]">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span>Kitchen online — {selectedCity}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
