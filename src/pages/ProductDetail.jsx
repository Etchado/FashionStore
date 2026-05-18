import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, ShoppingBag, Star, Bell, Share2, GitCompare, ChevronDown, ArrowLeft, Package, RefreshCw, Shield } from 'lucide-react'
import { useProducts } from '@/context/ProductsContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useToast } from '@/context/ToastContext'
import { useCurrency } from '@/context/CurrencyContext'
import { Badge } from '@/components/ui/Badge'
import { ReviewForm } from '@/components/product/ReviewForm'
import { useSEO } from '@/hooks/useSEO'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

const GOLD = 'linear-gradient(135deg, #ecc46e 0%, #c8861e 35%, #f4dca8 55%, #a86a14 80%, #ecc46e 100%)'

function AccordionSection({ label, open, onToggle, children }) {
  return (
    <div className="border-b border-stone-200 dark:border-stone-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[11px] font-body font-semibold uppercase tracking-[0.25em] text-stone-700 dark:text-stone-300">
          {label}
        </span>
        <ChevronDown
          size={14}
          className={cn('text-stone-400 transition-transform duration-200 flex-shrink-0', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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
  const discountPct = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

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
        <p className="font-body text-sm text-stone-400 uppercase tracking-wider mb-4">Product not found</p>
        <Link to="/shop" className="text-brand-500 hover:text-brand-400 font-body text-sm uppercase tracking-wider transition-colors">
          ← Return to shop
        </Link>
      </div>
    )
  }

  const images = product.images?.length > 1 ? product.images : [product.image]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2">
          <Link to="/" className="text-[10px] font-body uppercase tracking-[0.2em] text-stone-400 hover:text-brand-500 transition-colors">Home</Link>
          <span className="text-stone-300 dark:text-stone-600 text-[10px]">/</span>
          <Link to="/shop" className="text-[10px] font-body uppercase tracking-[0.2em] text-stone-400 hover:text-brand-500 transition-colors">Shop</Link>
          <span className="text-stone-300 dark:text-stone-600 text-[10px]">/</span>
          <span className="text-[10px] font-body uppercase tracking-[0.2em] text-stone-600 dark:text-stone-300 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

          {/* ── GALLERY ── */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => { setMainImg(src); setImgError(false) }}
                    className={cn(
                      'aspect-square overflow-hidden border transition-all',
                      mainImg === src
                        ? 'border-brand-400'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://placehold.co/72x72/e7e5e4/78716c?text=?' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-[4/5]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={mainImg}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={imgError ? 'https://placehold.co/600x750/e7e5e4/78716c?text=FASHION' : (mainImg || product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 start-4 flex flex-col gap-1.5">
                {product.badges?.map(b => <Badge key={b} type={b} />)}
                {discountPct && (
                  <span className="px-2 py-0.5 text-[10px] font-body font-semibold uppercase tracking-wider bg-stone-900 dark:bg-white text-white dark:text-stone-900">
                    -{discountPct}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── DETAILS ── */}
          <div className="flex flex-col">

            {/* Brand + Name */}
            <div className="mb-6">
              <p className="text-[10px] font-body text-stone-400 uppercase tracking-[0.3em] mb-2">{product.brand}</p>
              <h1 className="font-serif font-light leading-tight text-stone-900 dark:text-stone-100 mb-3"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={13} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'}
                      className={s <= Math.round(product.rating) ? 'text-brand-400' : 'text-stone-300 dark:text-stone-600'} />
                  ))}
                </div>
                <span className="text-xs font-body text-stone-400">{product.rating} · {product.reviewCount} {t('product.reviews')}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-stone-100 dark:border-stone-800">
              <span
                className="font-serif font-light"
                style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {format(price)}
              </span>
              {product.originalPrice && (
                <span className="font-body text-base text-stone-400 line-through">{format(product.originalPrice)}</span>
              )}
              {discountPct && (
                <span className="text-[10px] font-body font-semibold uppercase tracking-wider text-stone-500">Save {discountPct}%</span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <div className="mb-6">
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400 mb-3">{t('product.size')}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock === 0}
                      className={cn(
                        'px-4 py-2 text-xs font-body font-medium uppercase tracking-wider border transition-all',
                        variant?.id === v.id
                          ? 'bg-stone-900 dark:bg-white border-stone-900 dark:border-white text-white dark:text-stone-900'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-900 dark:hover:border-white',
                        v.stock === 0 && 'opacity-30 cursor-not-allowed line-through'
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.inStock && (
              <div className="mb-6">
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400 mb-3">{t('product.quantity')}</p>
                <div className="flex items-center border border-stone-200 dark:border-stone-700 w-fit">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-lg font-light"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-body font-medium text-stone-900 dark:text-stone-100 text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-lg font-light"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Low stock warning */}
            {product.inStock && product.stockCount <= 5 && (
              <p className="text-[11px] font-body uppercase tracking-wider text-brand-500 mb-4">
                Only {product.stockCount} left in stock
              </p>
            )}

            {/* Notify me (out of stock) */}
            {!product.inStock && (
              <div className="mb-6">
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400 mb-3">
                  <Bell size={10} className="inline me-1.5" />
                  Notify me when available
                </p>
                <form onSubmit={handleNotify} className="flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="flex-1 text-sm font-body bg-transparent border border-stone-200 dark:border-stone-700 px-3 py-2.5 outline-none focus:border-brand-400 transition-colors text-stone-800 dark:text-stone-100 placeholder-stone-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors flex-shrink-0"
                  >
                    Notify
                  </button>
                </form>
              </div>
            )}

            {/* Main actions */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => { addItem(product, variant, qty); addToast(t('toast.addedToCart')) }}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-500 dark:hover:bg-brand-500 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={14} />
                {product.inStock ? t('product.addToCart') : t('product.outOfStock')}
              </button>

              <button
                onClick={async () => { const added = await toggleWishlist(product.id); addToast(added ? t('wishlist.addedToast') : t('wishlist.removedToast')) }}
                className={cn(
                  'w-12 h-12 flex items-center justify-center border transition-colors flex-shrink-0',
                  wishlisted
                    ? 'border-brand-400 bg-brand-50 dark:bg-stone-800 text-brand-500'
                    : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:border-brand-400 hover:text-brand-500'
                )}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => { toggleCompare(product); addToast(comparing ? t('product.removeCompare') : t('product.compare')) }}
                className={cn(
                  'w-12 h-12 flex items-center justify-center border transition-colors flex-shrink-0',
                  comparing
                    ? 'border-brand-400 text-brand-500 bg-brand-50 dark:bg-stone-800'
                    : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:border-brand-400 hover:text-brand-500'
                )}
              >
                <GitCompare size={16} />
              </button>

              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); addToast(t('toast.copiedLink')) }}
                className="w-12 h-12 flex items-center justify-center border border-stone-200 dark:border-stone-700 text-stone-500 hover:border-brand-400 hover:text-brand-500 transition-colors flex-shrink-0"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-stone-100 dark:border-stone-800">
              {[
                { icon: Package, text: 'Free shipping over $150' },
                { icon: RefreshCw, text: '30-day returns' },
                { icon: Shield, text: 'Authenticity guaranteed' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={13} className="text-brand-400 flex-shrink-0" />
                  <span className="text-[10px] font-body uppercase tracking-wider text-stone-400">{text}</span>
                </div>
              ))}
            </div>

            {/* SKU */}
            <p className="text-[10px] font-body text-stone-300 dark:text-stone-600 uppercase tracking-wider mb-6">
              SKU: {product.sku}
            </p>

            {/* Accordion */}
            <div>
              <AccordionSection
                label={t('product.description')}
                open={openSection === 'description'}
                onToggle={() => setOpenSection(openSection === 'description' ? null : 'description')}
              >
                <p className="text-sm font-body text-stone-500 dark:text-stone-400 leading-relaxed">{product.description}</p>
              </AccordionSection>

              {product.specs && (
                <AccordionSection
                  label={t('product.details')}
                  open={openSection === 'details'}
                  onToggle={() => setOpenSection(openSection === 'details' ? null : 'details')}
                >
                  <dl className="space-y-2.5">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex gap-6 text-sm font-body">
                        <dt className="w-28 flex-shrink-0 text-[10px] uppercase tracking-wider text-stone-400">{k}</dt>
                        <dd className="text-stone-600 dark:text-stone-300">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionSection>
              )}

              {product.notes && (
                <AccordionSection
                  label="Scent Notes"
                  open={openSection === 'notes'}
                  onToggle={() => setOpenSection(openSection === 'notes' ? null : 'notes')}
                >
                  <p className="text-sm font-body text-stone-500 dark:text-stone-400 leading-relaxed">{product.notes}</p>
                </AccordionSection>
              )}

              <AccordionSection
                label={t('product.shipping')}
                open={openSection === 'shipping'}
                onToggle={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
              >
                <p className="text-sm font-body text-stone-500 dark:text-stone-400 leading-relaxed">
                  Free standard shipping on orders over $150. Express and overnight delivery available at checkout. Returns accepted within 30 days on unworn, sealed items with original packaging.
                </p>
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div className="mt-20 pt-16 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-100">
              {t('product.reviews')}
              <span className="text-stone-400 font-body text-base font-normal ms-3">({reviews.length})</span>
            </h2>
            {product.rating && (
              <div className="flex items-center gap-2">
                <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  className="font-serif text-3xl font-light">{product.rating}</span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={11} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'}
                        className={s <= Math.round(product.rating) ? 'text-brand-400' : 'text-stone-300'} />
                    ))}
                  </div>
                  <span className="text-[10px] font-body text-stone-400">{product.reviewCount} reviews</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Review list */}
            <div className="space-y-8">
              {reviews.length === 0
                ? <p className="font-body text-stone-400 text-sm">{t('product.noReviews')}</p>
                : reviews.map(r => (
                  <div key={r.id} className="flex gap-4">
                    <div className="w-8 h-8 bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 font-body font-semibold text-sm flex-shrink-0">
                      {r.user_id?.slice(0, 1).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} fill={s <= r.rating ? 'currentColor' : 'none'}
                              className={s <= r.rating ? 'text-brand-400' : 'text-stone-300'} />
                          ))}
                        </div>
                        <span className="text-[10px] font-body text-stone-400 uppercase tracking-wider">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-body text-stone-600 dark:text-stone-300 leading-relaxed">{r.comment || '—'}</p>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Write review */}
            <div>
              <h3 className="text-[11px] font-body font-semibold uppercase tracking-[0.25em] text-stone-500 mb-6">
                {t('product.writeReview')}
              </h3>
              <ReviewForm productId={product.id} onSubmit={async () => {
                const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false })
                if (data) setReviews(data)
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
