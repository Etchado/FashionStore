import { Suspense, lazy, useState, useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'

import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { CompareProvider } from '@/context/CompareContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { ProductsProvider } from '@/context/ProductsContext'

import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastStack } from '@/components/ui/Toast'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { ScrollProgressBar } from '@/components/layout/ScrollProgressBar'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CompareBar } from '@/components/product/CompareBar'
import { WhatsAppWidget } from '@/components/common/WhatsAppWidget'
import { BackToTop } from '@/components/common/BackToTop'
import { CookieBanner } from '@/components/common/CookieBanner'
import { AuthModal } from '@/components/auth/AuthModal'

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'))
const Shop = lazy(() => import('@/pages/Shop'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Wishlist = lazy(() => import('@/pages/Wishlist'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const Account = lazy(() => import('@/pages/Account'))
const Admin = lazy(() => import('@/pages/Admin'))
const Drops = lazy(() => import('@/pages/Drops'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Support = lazy(() => import('@/pages/Support'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AnimatedRoutes({ onAuthOpen }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/drops" element={<Drops />} />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function Shell() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <ScrollProgressBar />
      <AnnouncementBar />
      <Navbar onAuthOpen={() => setAuthOpen(true)} />
      <main className="flex-1">
        <AnimatedRoutes onAuthOpen={() => setAuthOpen(true)} />
      </main>
      <Footer />
      <CartDrawer />
      <CompareBar />
      <ToastStack />
      <WhatsAppWidget />
      <BackToTop />
      <CookieBanner />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ProductsProvider>
                <CurrencyProvider>
                  <CartProvider>
                    <WishlistProvider>
                      <CompareProvider>
                        <Shell />
                      </CompareProvider>
                    </WishlistProvider>
                  </CartProvider>
                </CurrencyProvider>
              </ProductsProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
