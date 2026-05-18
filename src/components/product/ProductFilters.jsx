import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { BRANDS, CATEGORIES } from '@/data/products'

const PRICE_RANGES = [
  { label: 'Under $200', min: 0, max: 200 },
  { label: '$200 – $500', min: 200, max: 500 },
  { label: '$500 – $2,000', min: 500, max: 2000 },
  { label: '$2,000+', min: 2000, max: Infinity },
]

export function ProductFilters({ filters, onChange, onClear, className }) {
  const { t } = useTranslation()

  const toggleArray = (key, value) => {
    const arr = filters[key] || []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    onChange({ ...filters, [key]: next })
  }

  const chip = (active) => cn(
    'px-3 py-1.5 rounded-full text-sm font-body border transition-all cursor-pointer select-none',
    active
      ? 'bg-brand-500 border-brand-500 text-white'
      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-brand-400 dark:hover:border-brand-500'
  )

  return (
    <aside className={cn('space-y-7', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-body font-semibold text-stone-900 dark:text-stone-100">{t('product.filters.title')}</h2>
        <button onClick={onClear} className="text-xs font-body text-brand-500 hover:text-brand-600 flex items-center gap-1">
          <X size={12} /> {t('product.filters.clear')}
        </button>
      </div>

      {/* Category */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">{t('product.filters.category')}</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <span key={cat} onClick={() => toggleArray('categories', cat)} className={chip((filters.categories || []).includes(cat))}>
              {t(`nav.${cat}`)}
            </span>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">{t('product.filters.brand')}</p>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {BRANDS.map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.brands || []).includes(brand)}
                onChange={() => toggleArray('brands', brand)}
                className="accent-brand-500 w-4 h-4 rounded"
              />
              <span className="text-sm font-body text-stone-600 dark:text-stone-300">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">{t('product.filters.price')}</p>
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map(range => {
            const active = filters.priceMin === range.min && filters.priceMax === range.max
            return (
              <span
                key={range.label}
                onClick={() => onChange(active ? { ...filters, priceMin: null, priceMax: null } : { ...filters, priceMin: range.min, priceMax: range.max })}
                className={chip(active)}
              >
                {range.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* In stock */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.inStock}
            onChange={e => onChange({ ...filters, inStock: e.target.checked })}
            className="accent-brand-500 w-4 h-4 rounded"
          />
          <span className="text-sm font-body text-stone-600 dark:text-stone-300">{t('product.filters.inStockOnly')}</span>
        </label>
      </div>

      <Button onClick={onClear} variant="secondary" size="sm" className="w-full">{t('product.filters.clear')}</Button>
    </aside>
  )
}
