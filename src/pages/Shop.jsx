import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react'
import { useProducts } from '@/context/ProductsContext'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Modal } from '@/components/ui/Modal'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

const SORT_OPTIONS = [
  { value: 'featured',  label: 'Featured' },
  { value: 'newest',    label: 'Newest' },
  { value: 'priceAsc',  label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'topRated',  label: 'Top Rated' },
  { value: 'deals',     label: 'Best Deals' },
]

const CATEGORY_META = {
  perfumes:    { title: 'Fragrances', sub: 'Rare & Signature Scents', img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1400&q=80' },
  watches:     { title: 'Timepieces', sub: 'Iconic Swiss & Luxury Watches', img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1400&q=80' },
  accessories: { title: 'Accessories', sub: 'Artisan Crafted Luxury', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&q=80' },
}

const GOLD = 'linear-gradient(135deg, #ecc46e 0%, #c8861e 35%, #f4dca8 55%, #a86a14 80%, #ecc46e 100%)'

export default function Shop() {
  const { t } = useTranslation()
  const { products, loading } = useProducts()
  const [params, setParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const sort = params.get('sort') || 'featured'

  useSEO({
    title: category ? CATEGORY_META[category]?.title || 'Shop' : 'The Collection',
    description: 'Discover authenticated luxury fragrances, timepieces, and accessories.',
  })

  const [filters, setFilters] = useState({
    categories: category ? [category] : [],
    brands: brand ? [brand] : [],
    priceMin: null,
    priceMax: null,
    inStock: false,
  })

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      categories: category ? [category] : [],
      brands: brand ? [brand] : [],
    }))
  }, [category, brand])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    const p = new URLSearchParams(params)
    if (newFilters.categories[0]) p.set('category', newFilters.categories[0])
    else p.delete('category')
    setParams(p)
  }

  const clearFilters = () => {
    setFilters({ categories: [], brands: [], priceMin: null, priceMax: null, inStock: false })
    setParams(new URLSearchParams())
  }

  const filtered = useMemo(() => {
    let list = [...products]
    if (filters.categories.length) list = list.filter(p => filters.categories.includes(p.category))
    if (filters.brands.length) list = list.filter(p => filters.brands.includes(p.brand))
    if (filters.priceMin != null) list = list.filter(p => p.price >= filters.priceMin)
    if (filters.priceMax != null && filters.priceMax !== Infinity) list = list.filter(p => p.price <= filters.priceMax)
    if (filters.inStock) list = list.filter(p => p.inStock)
    switch (sort) {
      case 'priceAsc':  list.sort((a, b) => a.price - b.price); break
      case 'priceDesc': list.sort((a, b) => b.price - a.price); break
      case 'topRated':  list.sort((a, b) => b.rating - a.rating); break
      case 'deals':     list.sort((a, b) => {
        const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0
        const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0
        return db - da
      }); break
      case 'newest': list.sort((a, b) => (b.badges?.includes('NEW') ? 1 : 0) - (a.badges?.includes('NEW') ? 1 : 0)); break
      default: break
    }
    return list
  }, [products, filters, sort])

  const setSort = (v) => {
    const p = new URLSearchParams(params)
    p.set('sort', v)
    setParams(p)
    setSortOpen(false)
  }

  const meta = category ? CATEGORY_META[category] : null
  const hasActiveFilters = filters.categories.length || filters.brands.length || filters.priceMin || filters.priceMax || filters.inStock
  const currentSort = SORT_OPTIONS.find(o => o.value === sort)

  return (
    <div>
      {/* ── HERO BANNER ── */}
      <div dir="ltr" className="relative h-52 md:h-72 bg-stone-950 dark:bg-black overflow-hidden">
        {meta?.img && (
          <img
            src={meta.img}
            alt={meta.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent dark:from-black dark:via-black/80" />

        <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="text-[10px] font-body uppercase tracking-[0.25em] text-white/40 hover:text-brand-400 transition-colors">Home</Link>
            <span className="text-white/20 text-[10px]">/</span>
            <span className="text-[10px] font-body uppercase tracking-[0.25em] text-brand-400/70">
              {meta?.title || 'The Collection'}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-light leading-none mb-2"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {meta?.title || 'The Collection'}
          </motion.h1>

          {meta?.sub && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-body text-white/40 text-sm tracking-wider uppercase"
            >
              {meta.sub}
            </motion.p>
          )}
        </div>

        {/* gold stripe */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
      </div>

      {/* ── TOOLBAR ── */}
      <div className="sticky top-navbar z-30 bg-white/95 dark:bg-stone-950/95 backdrop-blur border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-12 gap-4">
          {/* Left: filter toggle + count */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="hidden lg:flex items-center gap-2 text-xs font-body font-medium text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors uppercase tracking-wider"
            >
              <SlidersHorizontal size={14} />
              {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-body font-medium text-stone-600 dark:text-stone-300 hover:text-brand-500 transition-colors uppercase tracking-wider"
            >
              <SlidersHorizontal size={14} /> Filters
              {hasActiveFilters && <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">{[...filters.categories, ...filters.brands].length || '•'}</span>}
            </button>
            <span className="hidden sm:block text-xs font-body text-stone-400 border-l border-stone-200 dark:border-stone-700 pl-4">
              {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          {/* Right: sort + view */}
          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-2 text-xs font-body font-medium text-stone-600 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors uppercase tracking-wider"
              >
                {currentSort?.label}
                <ChevronDown size={12} className={cn('transition-transform', sortOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 top-full mt-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl z-50 py-1"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={cn(
                          'w-full text-start px-4 py-2.5 text-xs font-body uppercase tracking-wider transition-colors',
                          sort === opt.value
                            ? 'text-brand-500 bg-brand-50 dark:bg-stone-800'
                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 transition-colors', viewMode === 'grid' ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'text-stone-400 hover:text-stone-600')}
              >
                <Grid3X3 size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 transition-colors', viewMode === 'list' ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'text-stone-400 hover:text-stone-600')}
              >
                <LayoutList size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters strip */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden border-t border-stone-100 dark:border-stone-800"
            >
              <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-2 py-2 flex-wrap">
                <span className="text-[10px] font-body uppercase tracking-wider text-stone-400">Active:</span>
                {filters.categories.map(c => (
                  <button key={c} onClick={() => handleFilterChange({ ...filters, categories: filters.categories.filter(x => x !== c) })}
                    className="flex items-center gap-1 text-[10px] font-body font-medium uppercase tracking-wider px-2.5 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-brand-500 dark:hover:bg-brand-400 transition-colors">
                    {c} <X size={9} />
                  </button>
                ))}
                {filters.brands.map(b => (
                  <button key={b} onClick={() => handleFilterChange({ ...filters, brands: filters.brands.filter(x => x !== b) })}
                    className="flex items-center gap-1 text-[10px] font-body font-medium uppercase tracking-wider px-2.5 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-brand-500 dark:hover:bg-brand-400 transition-colors">
                    {b} <X size={9} />
                  </button>
                ))}
                {(filters.priceMin || filters.priceMax) && (
                  <button onClick={() => handleFilterChange({ ...filters, priceMin: null, priceMax: null })}
                    className="flex items-center gap-1 text-[10px] font-body font-medium uppercase tracking-wider px-2.5 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-brand-500 transition-colors">
                    Price <X size={9} />
                  </button>
                )}
                <button onClick={clearFilters} className="text-[10px] font-body text-stone-400 hover:text-brand-500 transition-colors ms-auto uppercase tracking-wider">
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex gap-8">
        {/* Desktop sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 224, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden lg:block flex-shrink-0 overflow-hidden"
            >
              <div className="w-56">
                <ProductFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={filtered} loading={loading} onClearFilters={clearFilters} viewMode={viewMode} />
        </div>
      </div>

      {/* Mobile filters modal */}
      <Modal open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filters" className="max-w-sm">
        <div className="p-6">
          <ProductFilters filters={filters} onChange={handleFilterChange} onClear={() => { clearFilters(); setMobileFiltersOpen(false) }} />
        </div>
      </Modal>
    </div>
  )
}
