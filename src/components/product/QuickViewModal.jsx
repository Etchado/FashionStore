import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Badge } from '@/components/ui/Badge'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { useCurrency } from '@/context/CurrencyContext'
import { cn } from '@/lib/cn'

import { GOLD } from '@/lib/constants'

export function QuickViewModal({ product, onClose }) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { format } = useCurrency()
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [imgError, setImgError] = useState(false)

  const variant = selectedVariant ?? product?.variants?.[0]
  const price = variant?.price ?? product?.price
  const wishlisted = product ? isWishlisted(product.id) : false
  const discountPct = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, variant)
    addToast(t('toast.addedToCart'))
    onClose()
  }

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white dark:bg-stone-950 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square sm:aspect-auto overflow-hidden bg-stone-100 dark:bg-stone-900">
                <img
                  src={imgError ? 'https://placehold.co/400x400/e7e5e4/78716c?text=FASHION' : product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
                {discountPct && (
                  <div className="absolute top-3 start-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5">
                    -{discountPct}%
                  </div>
                )}
                <div className="absolute top-3 start-3 flex flex-col gap-1 mt-6">
                  {product.badges?.map(b => <Badge key={b} type={b} />)}
                </div>
              </div>

              {/* Details */}
              <div className="p-7 flex flex-col gap-5 overflow-y-auto">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 end-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors z-10"
                  aria-label="Close"
                >
                  ✕
                </button>

                <div>
                  <p className="text-[10px] font-body uppercase tracking-[0.25em] text-stone-400 mb-1">{product.brand}</p>
                  <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 leading-snug mb-2">{product.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'}
                          className={s <= Math.round(product.rating) ? 'text-brand-400' : 'text-stone-300'} />
                      ))}
                    </div>
                    <span className="text-[11px] font-body text-stone-400">{product.rating} ({product.reviewCount})</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-serif text-2xl font-light"
                    style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {format(price)}
                  </span>
                  {product.originalPrice && (
                    <span className="font-body text-sm text-stone-400 line-through">{format(product.originalPrice)}</span>
                  )}
                </div>

                <p className="font-body text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Variants */}
                {product.variants && product.variants.length > 1 && (
                  <div>
                    <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-2">{t('product.size')}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          disabled={v.stock === 0}
                          className={cn(
                            'px-3 py-1.5 text-xs font-body font-medium border uppercase tracking-wider transition-all',
                            variant?.id === v.id
                              ? 'bg-stone-900 dark:bg-white border-stone-900 dark:border-white text-white dark:text-stone-900'
                              : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-500',
                            v.stock === 0 && 'opacity-30 cursor-not-allowed'
                          )}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={13} />
                    {product.inStock ? t('product.addToCart') : t('product.outOfStock')}
                  </button>
                  <button
                    onClick={async () => {
                      const added = await toggleWishlist(product.id)
                      addToast(added ? t('wishlist.addedToast') : t('wishlist.removedToast'))
                    }}
                    className={cn(
                      'w-11 h-11 flex items-center justify-center border transition-colors flex-shrink-0',
                      wishlisted
                        ? 'border-brand-400 text-brand-500 bg-brand-50 dark:bg-stone-800'
                        : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:border-brand-400 hover:text-brand-500'
                    )}
                  >
                    <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-[10px] font-body uppercase tracking-wider text-stone-400 hover:text-brand-500 transition-colors"
                >
                  View Full Details <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
