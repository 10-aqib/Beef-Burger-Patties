import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import ProductCustomizer from '@/components/menu/ProductCustomizer'
import AuthModal from '@/components/auth/AuthModal'
import SearchModal from '@/components/layout/SearchModal'
import LocationModal from '@/components/layout/LocationModal'

// Lazy-load pages for code splitting & performance
const HomePage = lazy(() => import('@/pages/HomePage'))
const MenuPage = lazy(() => import('@/pages/MenuPage'))
const DealsPage = lazy(() => import('@/pages/DealsPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const LocationsPage = lazy(() => import('@/pages/LocationsPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// ─── Page Loading Fallback ────────────────────────────────────
function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#080808' }}
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 border-[#FF3B1F] border-t-transparent"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
        <span className="text-label-sm text-[#525252] uppercase tracking-widest font-display">
          Sizzling on Steel...
        </span>
      </div>
    </div>
  )
}

// ─── Skip Link ────────────────────────────────────────────────
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] btn-primary text-label-md px-4 py-2"
      aria-label="Skip to main content"
    >
      Skip to content
    </a>
  )
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <SkipLink />

      {/* Global header */}
      <Header />

      {/* Page routes */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Global footer */}
      <Footer />

      {/* Global overlays */}
      <CartDrawer />
      <ProductCustomizer />
      <AuthModal />
      <SearchModal />
      <LocationModal />

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F1F1F',
            color: '#FFFFFF',
            border: '1px solid #2A2A2A',
            fontFamily: 'Space Grotesk',
            fontWeight: 600,
            letterSpacing: '0.04em',
            fontSize: '13px',
            borderRadius: '4px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#34D399', secondary: '#1F1F1F' },
          },
          error: {
            iconTheme: { primary: '#FF3B1F', secondary: '#1F1F1F' },
          },
        }}
      />
    </BrowserRouter>
  )
}
