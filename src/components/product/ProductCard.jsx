import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, Eye, GitCompare, ShoppingBag, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useToast } from '@/context/ToastContext'
import { useCurrency } from '@/context/CurrencyContext'
import { cn } from '@/lib/cn'

export function ProductCard({ product, index = 0, onQuickView }) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()
  const { toggle: toggleCompare, isComparing } = useCompare()
  const { addToast } = useToast()
  const { format } = useCurrency()
  const [imgError, setImgError] = useState(false)

  const wishlisted = isWishlisted(product.id)
  const comparing = isComparing(product.id)
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!product.inStock) return
    addItem(product, product.variants?.[0])
    addToast(t('toast.addedToCart'))
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    const added = await toggleWishlist(product.id)
    addToast(added ? t('wishlist.addedToast') : t('wishlist.removedToast'))
  }

  const handleCompare = (e) => {
    e.preventDefault()
    toggleCompare(product)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group relative flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
          <img
            src={imgError ? 'https://placehold.co/400x533/e7e5e4/78716c?text=FASHION' : product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-1">
            {product.badges?.map(b => <Badge key={b} type={b} />)}
            {discountPct && <Badge type="SALE" />}
          </div>

          {/* Discount pct */}
          {discountPct && (
            <div className="absolute top-3 end-3 bg-red-500 text-white text-xs font-body font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 p-3">
            <div className="flex gap-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur rounded-full px-3 py-1.5 shadow-lg">
              <button onClick={handleWishlist} title={t('product.addToWishlist')} className={cn('p-1 transition-colors', wishlisted ? 'text-red-500' : 'text-stone-500 hover:text-red-500')}>
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              {onQuickView && (
                <button onClick={(e) => { e.preventDefault(); onQuickView(product) }} title={t('product.quickView')} className="p-1 text-stone-500 hover:text-brand-500 transition-colors">
                  <Eye size={16} />
                </button>
              )}
              <button onClick={handleCompare} title={t('product.compare')} className={cn('p-1 transition-colors', comparing ? 'text-brand-500' : 'text-stone-500 hover:text-brand-500')}>
                <GitCompare size={16} />
              </button>
            </div>
          </div>

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
              <span className="font-body text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-full shadow">
                {t('product.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <p className="text-xs font-body text-stone-400 uppercase tracking-wider">{product.brand}</p>
          <h3 className="font-serif text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1">
            <Star size={12} fill="currentColor" className="text-brand-400" />
            <span className="text-xs font-body text-stone-500">{product.rating} ({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{format(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-stone-400 line-through">{format(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={!product.inStock}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-sm font-body font-medium text-stone-700 dark:text-stone-200 hover:bg-brand-500 hover:text-white hover:border-brand-500 dark:hover:bg-brand-500 dark:hover:border-brand-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShoppingBag size={15} />
        {product.inStock ? t('product.addToCart') : t('product.outOfStock')}
      </motion.button>
    </motion.div>
  )
}
