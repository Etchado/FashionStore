import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Heart, Star, ExternalLink } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { useCurrency } from '@/context/CurrencyContext'
import { cn } from '@/lib/cn'

export function QuickViewModal({ product, onClose }) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { format } = useCurrency()
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [imgError, setImgError] = useState(false)

  if (!product) return null

  const variant = selectedVariant ?? product.variants?.[0]
  const price = variant?.price ?? product.price
  const wishlisted = isWishlisted(product.id)

  const handleAdd = () => {
    addItem(product, variant)
    addToast(t('toast.addedToCart'))
    onClose()
  }

  return (
    <Modal open={!!product} onClose={onClose} className="max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Image */}
        <div className="aspect-square sm:aspect-auto sm:h-full bg-stone-100 dark:bg-stone-800 rounded-s-2xl overflow-hidden">
          <img
            src={imgError ? 'https://placehold.co/400x400/e7e5e4/78716c?text=AURA' : product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col gap-4">
          <div>
            <div className="flex gap-1 mb-2">
              {product.badges?.map(b => <Badge key={b} type={b} />)}
            </div>
            <p className="text-xs font-body text-stone-400 uppercase tracking-wider">{product.brand}</p>
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 mt-1">{product.name}</h2>
            <div className="flex items-center gap-1 mt-1">
              <Star size={13} fill="currentColor" className="text-brand-400" />
              <span className="text-xs font-body text-stone-500">{product.rating} ({product.reviewCount} {t('product.reviews')})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-body text-xl font-semibold text-stone-900 dark:text-stone-100">{format(price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-stone-400 line-through">{format(product.originalPrice)}</span>
            )}
          </div>

          <p className="font-body text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div>
              <p className="font-body text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wide">{t('product.size')}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-body border transition-all',
                      (variant?.id === v.id) ? 'bg-brand-500 border-brand-500 text-white' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300',
                      v.stock === 0 && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <Button onClick={handleAdd} disabled={!product.inStock} className="flex-1 gap-2">
              <ShoppingBag size={16} />
              {t('product.addToCart')}
            </Button>
            <button
              onClick={async () => {
                const added = await toggleWishlist(product.id)
                addToast(added ? t('wishlist.addedToast') : t('wishlist.removedToast'))
              }}
              className={cn('p-2.5 rounded-full border transition-colors', wishlisted ? 'border-red-400 text-red-500' : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:border-red-400 hover:text-red-500')}
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <Link to={`/product/${product.id}`} onClick={onClose} className="flex items-center gap-1 text-sm font-body text-brand-500 hover:text-brand-600 transition-colors">
            View Full Details <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </Modal>
  )
}
