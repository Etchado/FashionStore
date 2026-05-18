import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { BRANDS, CATEGORIES } from '@/data/products'

const PRICE_RANGES = [
  { label: 'Under $200',      min: 0,    max: 200      },
  { label: '$200 – $500',     min: 200,  max: 500      },
  { label: '$500 – $2,000',   min: 500,  max: 2000     },
  { label: '$2,000+',         min: 2000, max: Infinity  },
]

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-stone-100 dark:border-stone-800 pb-5">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-1 mb-4 group"
      >
        <span className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
          {title}
        </span>
        <ChevronDown size={12} className={cn('text-stone-400 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && children}
    </div>
  )
}

export function ProductFilters({ filters, onChange, onClear, className }) {
  const { t } = useTranslation()

  const toggleArray = (key, value) => {
    const arr = filters[key] || []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    onChange({ ...filters, [key]: next })
  }

  return (
    <aside className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between pb-5 border-b border-stone-100 dark:border-stone-800">
        <span className="text-xs font-body font-semibold uppercase tracking-[0.25em] text-stone-900 dark:text-stone-100">
          Refine
        </span>
        <button
          onClick={onClear}
          className="text-[10px] font-body uppercase tracking-wider text-stone-400 hover:text-brand-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-0">
          {CATEGORIES.map(cat => {
            const active = (filters.categories || []).includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleArray('categories', cat)}
                className={cn(
                  'w-full flex items-center justify-between py-2 text-sm font-body transition-colors text-start',
                  active
                    ? 'text-stone-900 dark:text-white font-medium'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                <span>{t(`nav.${cat}`)}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="flex flex-col gap-0 max-h-52 overflow-y-auto">
          {BRANDS.map(brand => {
            const active = (filters.brands || []).includes(brand)
            return (
              <button
                key={brand}
                onClick={() => toggleArray('brands', brand)}
                className={cn(
                  'w-full flex items-center justify-between py-2 text-sm font-body transition-colors text-start',
                  active
                    ? 'text-stone-900 dark:text-white font-medium'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                <span>{brand}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price">
        <div className="flex flex-col gap-0">
          {PRICE_RANGES.map(range => {
            const active = filters.priceMin === range.min && filters.priceMax === range.max
            return (
              <button
                key={range.label}
                onClick={() => onChange(active
                  ? { ...filters, priceMin: null, priceMax: null }
                  : { ...filters, priceMin: range.min, priceMax: range.max }
                )}
                className={cn(
                  'w-full flex items-center justify-between py-2 text-sm font-body transition-colors text-start',
                  active
                    ? 'text-stone-900 dark:text-white font-medium'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                <span>{range.label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* In stock */}
      <div className="pb-5">
        <button
          onClick={() => onChange({ ...filters, inStock: !filters.inStock })}
          className={cn(
            'w-full flex items-center justify-between py-2 text-sm font-body transition-colors',
            filters.inStock
              ? 'text-stone-900 dark:text-white font-medium'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          )}
        >
          <span>In stock only</span>
          <div className={cn(
            'w-8 h-4 rounded-full transition-colors relative flex-shrink-0',
            filters.inStock ? 'bg-brand-500' : 'bg-stone-200 dark:bg-stone-700'
          )}>
            <div className={cn(
              'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
              filters.inStock ? 'translate-x-4' : 'translate-x-0.5'
            )} />
          </div>
        </button>
      </div>
    </aside>
  )
}
