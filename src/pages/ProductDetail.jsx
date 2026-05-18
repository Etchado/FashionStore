import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Heart, ShoppingBag, Star, Bell, Share2, GitCompare, ChevronDown } from 'lucide-react'
import { useProducts } from '@/context/ProductsContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useToast } from '@/context/ToastContext'
import { useCurrency } from '@/context/CurrencyContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ReviewForm } from '@/components/product/ReviewForm'
import { useSEO } from '@/hooks/useSEO'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { getProduct } = useProducts()
  const { addItem } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()
  const { toggle: toggleCompare, isComparing } = useCompare()
  const { addToast } = useToast()
  const { format } = useCurrency()

  const product = getProduct(id)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [mainImg, setMainImg] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [reviews, setReviews] = useState([])
  const [notifyEmail, setNotifyEmail] = useState('')
  const [openSection, setOpenSection] = useState('description')

  const variant = selectedVariant ?? product?.variants?.[0]
  const price = variant?.price ?? product?.price
  const wishlisted = product ? isWishlisted(product.id) : false
  const comparing = product ? isComparing(product.id) : false

  useSEO({
    title: product?.name,
    description: product?.description,
    image: product?.image,
  })

  useEffect(() => {
    if (!product) return
    setMainImg(product.image)
    setSelectedVariant(product.variants?.[0])

    const fetchReviews = async () => {
      const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false })
      if (data) setReviews(data)
    }
    fetchReviews()
  }, [product?.id])

  const handleNotify = async (e) => {
    e.preventDefault()
    if (!notifyEmail) return
    await supabase.from('stock_notifications').upsert({ product_id: product.id, email: notifyEmail })
    addToast(t('product.notifySuccess'))
    setNotifyEmail('')
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">Product not found</h2>
        <Link to="/shop" className="mt-4 inline-block text-brand-500 hover:text-brand-600">← Back to shop</Link>
      </div>
    )
  }

  const accordion = (key, label, content) => (
    <div className="border-b border-stone-200 dark:border-stone-700">
      <button
        onClick={() => setOpenSection(openSection === key ? null : key)}
        className="w-full flex items-center justify-between py-4 text-sm font-body font-semibold text-stone-900 dark:text-stone-100"
      >
        {label}
        <ChevronDown size={16} className={cn('transition-transform text-stone-400', openSection === key && 'rotate-180')} />
      </button>
      {openSection === key && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pb-4">
          {content}
        </motion.div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="flex gap-3">
          {product.images && product.images.length > 1 && (
            <div className="flex flex-col gap-2 w-16">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => { setMainImg(src); setImgError(false) }}
                  className={cn('aspect-square rounded-lg overflow-hidden border-2 transition-all', mainImg === src ? 'border-brand-500' : 'border-transparent')}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://placehold.co/64x64/e7e5e4/78716c?text=?' }} />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
            <motion.img
              key={mainImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={imgError ? 'https://placehold.co/600x600/e7e5e4/78716c?text=FASHION' : (mainImg || product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex gap-1.5 mb-3">{product.badges?.map(b => <Badge key={b} type={b} />)}</div>
            <p className="text-xs font-body text-stone-400 uppercase tracking-wider">{product.brand}</p>
            <h1 className="font-serif text-4xl text-stone-900 dark:text-stone-100 mt-1 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= product.rating ? 'currentColor' : 'none'} className={s <= product.rating ? 'text-brand-400' : 'text-stone-300'} />)}
              </div>
              <span className="text-sm font-body text-stone-500">{product.rating} · {product.reviewCount} {t('product.reviews')}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="font-body text-3xl font-semibold text-stone-900 dark:text-stone-100">{format(price)}</span>
            {product.originalPrice && <span className="font-body text-lg text-stone-400 line-through">{format(product.originalPrice)}</span>}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">{t('product.size')}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-body border transition-all',
                      variant?.id === v.id ? 'bg-brand-500 border-brand-500 text-white' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-brand-400',
                      v.stock === 0 && 'opacity-40 cursor-not-allowed line-through'
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">{t('product.quantity')}</p>
            <div className="flex items-center gap-3 border border-stone-200 dark:border-stone-700 rounded-full w-fit px-4 py-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-stone-500 hover:text-brand-500 font-bold text-lg leading-none">−</button>
              <span className="font-body font-medium text-stone-900 dark:text-stone-100 w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="text-stone-500 hover:text-brand-500 font-bold text-lg leading-none">+</button>
            </div>
          </div>

          {/* Stock */}
          {product.inStock
            ? product.stockCount <= 5 && <p className="text-sm font-body text-amber-500">{t('product.lowStock', { count: product.stockCount })}</p>
            : (
              <form onSubmit={handleNotify} className="flex gap-2">
                <input type="email" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} placeholder={t('auth.email')} className="flex-1 text-sm font-body bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-400" required />
                <Button type="submit" variant="secondary" size="sm" className="gap-1.5"><Bell size={14} />{t('product.notifyMe')}</Button>
              </form>
            )
          }

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => { addItem(product, variant, qty); addToast(t('toast.addedToCart')) }}
              disabled={!product.inStock}
              className="flex-1 gap-2"
              size="lg"
            >
              <ShoppingBag size={18} />
              {product.inStock ? t('product.addToCart') : t('product.outOfStock')}
            </Button>
            <button
              onClick={async () => { const added = await toggleWishlist(product.id); addToast(added ? t('wishlist.addedToast') : t('wishlist.removedToast')) }}
              className={cn('p-3.5 rounded-full border transition-colors', wishlisted ? 'border-red-400 text-red-500 bg-red-50 dark:bg-red-950' : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:border-red-400 hover:text-red-500')}
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => { toggleCompare(product); addToast(comparing ? t('product.removeCompare') : t('product.compare')) }}
              className={cn('p-3.5 rounded-full border transition-colors', comparing ? 'border-brand-400 text-brand-500' : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:border-brand-400')}
            >
              <GitCompare size={20} />
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); addToast(t('toast.copiedLink')) }}
              className="p-3.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-brand-500 hover:border-brand-400 transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>

          <p className="text-xs font-body text-stone-400">{t('product.sku')}: {product.sku}</p>

          {/* Accordion */}
          <div className="border-t border-stone-200 dark:border-stone-700">
            {accordion('description', t('product.description'),
              <p className="text-sm font-body text-stone-500 dark:text-stone-400 leading-relaxed">{product.description}</p>
            )}
            {product.specs && accordion('details', t('product.details'),
              <dl className="space-y-2">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex gap-4 text-sm font-body">
                    <dt className="w-32 text-stone-400 flex-shrink-0">{k}</dt>
                    <dd className="text-stone-700 dark:text-stone-300">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {product.notes && accordion('notes', 'Scent Notes',
              <p className="text-sm font-body text-stone-500 dark:text-stone-400 leading-relaxed">{product.notes}</p>
            )}
            {accordion('shipping', t('product.shipping'),
              <p className="text-sm font-body text-stone-500 dark:text-stone-400 leading-relaxed">Free shipping on orders over $150. Express delivery available. 30-day returns on unworn/sealed items.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-stone-200 dark:border-stone-700 pt-12">
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-8">{t('product.reviews')} ({reviews.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {reviews.length === 0
              ? <p className="font-body text-stone-400 text-sm">{t('product.noReviews')}</p>
              : reviews.map(r => (
                <div key={r.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-500 font-body font-semibold text-sm flex-shrink-0">
                    {r.user_id?.slice(0, 1).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? 'currentColor' : 'none'} className={s <= r.rating ? 'text-brand-400' : 'text-stone-300'} />)}
                    </div>
                    <p className="text-sm font-body text-stone-600 dark:text-stone-300">{r.comment || '—'}</p>
                  </div>
                </div>
              ))
            }
          </div>
          <div>
            <h3 className="font-body font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('product.writeReview')}</h3>
            <ReviewForm productId={product.id} onSubmit={async () => {
              const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false })
              if (data) setReviews(data)
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
