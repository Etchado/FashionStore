import { useState } from 'react'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { QuickViewModal } from './QuickViewModal'
import { useTranslation } from 'react-i18next'
import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ProductGrid({ products, loading, onClearFilters }) {
  const { t } = useTranslation()
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <PackageSearch size={48} className="text-stone-300 dark:text-stone-600" />
        <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100">{t('product.emptyState.title')}</h3>
        <p className="font-body text-stone-500 text-sm">{t('product.emptyState.subtitle')}</p>
        {onClearFilters && <Button variant="secondary" onClick={onClearFilters}>{t('product.emptyState.cta')}</Button>}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  )
}
