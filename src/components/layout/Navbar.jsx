import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Search, ShoppingBag, Heart, Sun, Moon, Globe,
  Menu, X, ChevronDown, User
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useProducts } from '@/context/ProductsContext'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import i18n from '@/i18n'

const MEGA_MENU = [
  {
    label: 'nav.perfumes', href: '/shop?category=perfumes',
    items: [
      { label: 'Men\'s Fragrances', href: '/shop?category=perfumes&gender=men' },
      { label: 'Women\'s Fragrances', href: '/shop?category=perfumes&gender=women' },
      { label: 'Unisex', href: '/shop?category=perfumes&gender=unisex' },
      { label: 'Gift Sets', href: '/shop?category=perfumes&tag=gift' },
    ]
  },
  {
    label: 'nav.watches', href: '/shop?category=watches',
    items: [
      { label: 'Dress Watches', href: '/shop?category=watches&style=dress' },
      { label: 'Dive Watches', href: '/shop?category=watches&style=dive' },
      { label: 'Chronographs', href: '/shop?category=watches&style=chrono' },
      { label: 'Luxury Brands', href: '/shop?category=watches&sort=priceDesc' },
    ]
  },
  {
    label: 'nav.accessories', href: '/shop?category=accessories',
    items: [
      { label: 'Sunglasses', href: '/shop?category=accessories&sub=sunglasses' },
      { label: 'Bracelets', href: '/shop?category=accessories&sub=bracelets' },
      { label: 'Wallets', href: '/shop?category=accessories&sub=wallets' },
      { label: 'Belts', href: '/shop?category=accessories&sub=belts' },
    ]
  },
  {
    label: 'nav.brands', href: '/shop',
    items: [
      { label: 'Chanel', href: '/shop?brand=Chanel' },
      { label: 'Tom Ford', href: '/shop?brand=Tom+Ford' },
      { label: 'Rolex', href: '/shop?brand=Rolex' },
      { label: 'Creed', href: '/shop?brand=Creed' },
    ]
  },
]

export function Navbar({ onAuthOpen }) {
  const { t } = useTranslation()
  const { theme, toggle } = useTheme()
  const { count: cartCount, setOpen: setCartOpen } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user, isAdmin, signOut } = useAuth()
  const { currency, changeCurrency, CURRENCIES } = useCurrency()
  const { products } = useProducts()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [megaOpen, setMegaOpen] = useState(null)
  const [mobileExpanded, setMobileExpanded] = useState(null)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const searchRef = useRef(null)
  const debouncedSearch = useDebounce(searchQuery, 200)

  const searchResults = debouncedSearch.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(debouncedSearch.toLowerCase())
      ).slice(0, 6)
    : []

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
      <nav className="max-w-7xl mx-auto px-4 h-navbar flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0" onClick={() => window.scrollTo(0, 0)}>
          <span className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            FASHION<span className="text-brand-500">.</span>
          </span>
        </Link>

        {/* Desktop mega menu */}
        <div className="hidden lg:flex items-center gap-1 flex-1 ms-6">
          {MEGA_MENU.map((cat) => (
            <div
              key={cat.label}
              className="relative"
              onMouseEnter={() => setMegaOpen(cat.label)}
              onMouseLeave={() => setMegaOpen(null)}
            >
              <Link
                to={cat.href}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-body text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg',
                  megaOpen === cat.label && 'text-brand-500 dark:text-brand-400'
                )}
              >
                {t(cat.label)}
                <ChevronDown size={14} className={cn('transition-transform', megaOpen === cat.label && 'rotate-180')} />
              </Link>

              <AnimatePresence>
                {megaOpen === cat.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full start-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl py-2"
                  >
                    {cat.items.map(item => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block px-4 py-2 text-sm font-body text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                        onClick={() => setMegaOpen(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <Link to="/builder" className="px-3 py-2 text-sm font-body text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg">
            {t('nav.builder')}
          </Link>
          <Link to="/shop?sort=deals" className="px-3 py-2 text-sm font-body text-red-500 hover:text-red-600 transition-colors rounded-lg font-medium">
            {t('nav.sale')}
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ms-auto">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute end-0 top-full mt-2 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                    <Search size={16} className="text-stone-400" />
                    <input
                      ref={searchRef}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search')}
                      className="flex-1 text-sm font-body bg-transparent outline-none text-stone-800 dark:text-stone-100 placeholder-stone-400"
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-stone-400" /></button>}
                  </div>
                  {debouncedSearch.length >= 2 && (
                    <div>
                      {searchResults.length === 0
                        ? <p className="px-4 py-3 text-sm font-body text-stone-400">{t('nav.noResults')}</p>
                        : searchResults.map(p => (
                          <button
                            key={p.id}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-start"
                            onClick={() => { navigate(`/product/${p.id}`); setSearchOpen(false); setSearchQuery('') }}
                          >
                            <img
                              src={p.image} alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={e => { e.target.src = 'https://placehold.co/40x40/stone/white?text=?' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-body font-medium text-stone-800 dark:text-stone-100 truncate">{p.name}</p>
                              <p className="text-xs font-body text-stone-400">{p.brand}</p>
                            </div>
                            <span className="text-sm font-body text-brand-500 font-medium">${p.price}</span>
                          </button>
                        ))
                      }
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language */}
          <button
            onClick={toggleLang}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg flex items-center gap-1 text-xs font-body font-medium"
            aria-label="Toggle language"
          >
            <Globe size={16} />
            <span>{i18n.language.toUpperCase()}</span>
          </button>

          {/* Currency */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setCurrencyOpen(v => !v)}
              className="p-2 text-xs font-body font-medium text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg"
            >
              {currency}
            </button>
            <AnimatePresence>
              {currencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute end-0 top-full mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl py-1 w-36 z-50"
                >
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { changeCurrency(c.code); setCurrencyOpen(false) }}
                      className={cn(
                        'w-full text-start px-4 py-2 text-sm font-body hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors',
                        currency === c.code ? 'text-brand-500 font-medium' : 'text-stone-600 dark:text-stone-300'
                      )}
                    >
                      {c.code} {c.symbol}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => user ? setAccountOpen(v => !v) : onAuthOpen()}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg"
              aria-label="Account"
            >
              <User size={18} />
            </button>
            <AnimatePresence>
              {accountOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute end-0 top-full mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl py-1 w-48 z-50"
                >
                  <Link to="/account" className="block px-4 py-2 text-sm font-body text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800" onClick={() => setAccountOpen(false)}>My Account</Link>
                  {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm font-body text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800" onClick={() => setAccountOpen(false)}>Admin Panel</Link>}
                  <hr className="border-stone-100 dark:border-stone-800 my-1" />
                  <button onClick={() => { signOut(); setAccountOpen(false) }} className="w-full text-start px-4 py-2 text-sm font-body text-red-500 hover:bg-stone-50 dark:hover:bg-stone-800">Sign Out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg" aria-label="Wishlist">
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 min-w-[16px] h-4 bg-brand-500 text-white text-[10px] font-body font-bold rounded-full flex items-center justify-center px-0.5">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 min-w-[16px] h-4 bg-brand-500 text-white text-[10px] font-body font-bold rounded-full flex items-center justify-center px-0.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-brand-500 transition-colors rounded-lg"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {MEGA_MENU.map(cat => (
                <div key={cat.label}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === cat.label ? null : cat.label)}
                    className="w-full flex items-center justify-between py-2.5 text-sm font-body font-medium text-stone-700 dark:text-stone-200"
                  >
                    {t(cat.label)}
                    <ChevronDown size={14} className={cn('transition-transform', mobileExpanded === cat.label && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {mobileExpanded === cat.label && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden ps-4"
                      >
                        {cat.items.map(item => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="block py-2 text-sm font-body text-stone-500 dark:text-stone-400 hover:text-brand-500"
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <Link to="/builder" className="block py-2.5 text-sm font-body font-medium text-stone-700 dark:text-stone-200" onClick={() => setMobileOpen(false)}>{t('nav.builder')}</Link>
              <Link to="/shop?sort=deals" className="block py-2.5 text-sm font-body font-medium text-red-500" onClick={() => setMobileOpen(false)}>{t('nav.sale')}</Link>
              <hr className="border-stone-100 dark:border-stone-800 my-2" />
              {user
                ? <>
                  <Link to="/account" className="block py-2.5 text-sm font-body text-stone-700 dark:text-stone-200" onClick={() => setMobileOpen(false)}>My Account</Link>
                  {isAdmin && <Link to="/admin" className="block py-2.5 text-sm font-body text-stone-700 dark:text-stone-200" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
                  <button onClick={() => { signOut(); setMobileOpen(false) }} className="w-full text-start py-2.5 text-sm font-body text-red-500">Sign Out</button>
                </>
                : <button onClick={() => { onAuthOpen(); setMobileOpen(false) }} className="w-full text-start py-2.5 text-sm font-body text-stone-700 dark:text-stone-200">Sign In</button>
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
