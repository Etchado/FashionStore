import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X } from 'lucide-react'
import { useProducts } from '@/context/ProductsContext'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Modal } from '@/components/ui/Modal'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

const SORT_OPTIONS = ['featured', 'priceAsc', 'priceDesc', 'topRated', 'deals', 'newest']

export default function Shop() {
  const { t } = useTranslation()
  const { products, loading } = useProducts()
  const [params, setParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useSEO({ title: t('nav.shop') })

  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const sort = params.get('sort') || 'featured'

  const [filters, setFilters] = useState({
    categories: category ? [category] : [],
    brands: brand ? [brand] : [],
    priceMin: null,
    priceMax: null,
    inStock: false,
  })

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
      case 'priceAsc': list.sort((a, b) => a.price - b.price); break
      case 'priceDesc': list.sort((a, b) => b.price - a.price); break
      case 'topRated': list.sort((a, b) => b.rating - a.rating); break
      case 'deals': list.sort((a, b) => {
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
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100">{t('nav.shop')}</h1>
          <p className="font-body text-sm text-stone-400 mt-1">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm font-body bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-400 text-stone-700 dark:text-stone-200"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s} value={s}>{t(`product.sort.${s}`)}</option>
            ))}
          </select>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-body font-medium text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <SlidersHorizontal size={15} /> {t('product.filters.title')}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <ProductFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={filtered} loading={loading} onClearFilters={clearFilters} />
        </div>
      </div>

      {/* Mobile filters modal */}
      <Modal open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title={t('product.filters.title')} className="max-w-sm">
        <div className="p-6">
          <ProductFilters filters={filters} onChange={handleFilterChange} onClear={() => { clearFilters(); setMobileFiltersOpen(false) }} />
        </div>
      </Modal>
    </div>
  )
}
