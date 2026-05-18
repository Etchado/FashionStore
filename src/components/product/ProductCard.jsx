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
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-900">
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
          </div>

          {/* Discount pct */}
          {discountPct && (
            <div className="absolute top-3 end-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5">
              -{discountPct}%
            </div>
          )}

          {/* Side action rail — appears on hover */}
          <div className="absolute top-3 end-3 flex flex-col gap-1.5 translate-x-8 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleWishlist}
              title={t('product.addToWishlist')}
              className={cn(
                'w-8 h-8 flex items-center justify-center bg-white dark:bg-stone-900 shadow-sm transition-colors',
                wishlisted ? 'text-brand-500' : 'text-stone-500 hover:text-brand-500'
              )}
            >
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            {onQuickView && (
              <button
                onClick={(e) => { e.preventDefault(); onQuickView(product) }}
                title={t('product.quickView')}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-stone-900 text-stone-500 hover:text-brand-500 shadow-sm transition-colors"
              >
                <Eye size={14} />
              </button>
            )}
            <button
              onClick={handleCompare}
              title={t('product.compare')}
              className={cn(
                'w-8 h-8 flex items-center justify-center bg-white dark:bg-stone-900 shadow-sm transition-colors',
                comparing ? 'text-brand-500' : 'text-stone-500 hover:text-brand-500'
              )}
            >
              <GitCompare size={14} />
            </button>
          </div>

          {/* Add to cart — slides up from bottom on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full flex items-center justify-center gap-2 py-3 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={13} />
              {product.inStock ? t('product.addToCart') : t('product.outOfStock')}
            </button>
          </div>

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/60 flex items-center justify-center">
              <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 px-4 py-2">
                {t('product.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1">
          <p className="text-[10px] font-body text-stone-400 uppercase tracking-[0.2em]">{product.brand}</p>
          <h3 className="font-serif text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 pt-0.5">
            <Star size={11} fill="currentColor" className="text-brand-400" />
            <span className="text-[11px] font-body text-stone-400">{product.rating} ({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{format(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-stone-400 line-through">{format(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
