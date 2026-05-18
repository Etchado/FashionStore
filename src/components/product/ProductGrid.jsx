import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { QuickViewModal } from './QuickViewModal'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { useCurrency } from '@/context/CurrencyContext'
import { Badge } from '@/components/ui/Badge'
import { PackageSearch, ShoppingBag, Heart, Star } from 'lucide-react'
import { cn } from '@/lib/cn'

function ProductListItem({ product, index }) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { format } = useCurrency()
  const wishlisted = isWishlisted(product.id)
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="flex gap-5 border-b border-stone-100 dark:border-stone-800 pb-6"
    >
      <Link to={`/product/${product.id}`} className="flex-shrink-0">
        <div className="relative w-28 h-36 overflow-hidden bg-stone-100 dark:bg-stone-900">
          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          {discountPct && (
            <div className="absolute top-1.5 start-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[9px] font-body font-semibold uppercase tracking-wider px-1.5 py-0.5">
              -{discountPct}%
            </div>
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[10px] font-body text-stone-400 uppercase tracking-[0.2em] mb-1">{product.brand}</p>
              <Link to={`/product/${product.id}`}>
                <h3 className="font-serif text-stone-900 dark:text-stone-100 leading-snug hover:text-brand-500 transition-colors">{product.name}</h3>
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              {product.badges?.map(b => <Badge key={b} type={b} />)}
            </div>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <Star size={11} fill="currentColor" className="text-brand-400" />
            <span className="text-[11px] font-body text-stone-400">{product.rating} ({product.reviewCount})</span>
          </div>
          {product.description && (
            <p className="text-sm font-body text-stone-400 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{format(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-stone-400 line-through">{format(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const added = await toggleWishlist(product.id)
                addToast(added ? t('wishlist.addedToast') : t('wishlist.removedToast'))
              }}
              className={cn('p-1.5 transition-colors', wishlisted ? 'text-brand-500' : 'text-stone-400 hover:text-brand-500')}
            >
              <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => { if (product.inStock) { addItem(product, product.variants?.[0]); addToast(t('toast.addedToCart')) } }}
              disabled={!product.inStock}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={12} />
              {product.inStock ? 'Add to Cart' : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ProductGrid({ products, loading, onClearFilters, viewMode = 'grid' }) {
  const { t } = useTranslation()
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
        <PackageSearch size={40} className="text-stone-300 dark:text-stone-600" />
        <div>
          <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-1">{t('product.emptyState.title')}</h3>
          <p className="font-body text-stone-400 text-sm">{t('product.emptyState.subtitle')}</p>
        </div>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] border border-stone-300 dark:border-stone-700 px-6 py-3 text-stone-600 dark:text-stone-300 hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            {t('product.emptyState.cta')}
          </button>
        )}
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="flex flex-col gap-6">
          {products.map((product, i) => (
            <ProductListItem key={product.id} product={product} index={i} />
          ))}
        </div>
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      </>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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
