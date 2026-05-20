import { useTranslation } from 'react-i18next'
import { Heart, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useWishlist } from '@/context/WishlistContext'
import { useProducts } from '@/context/ProductsContext'
import { ProductCard } from '@/components/product/ProductCard'
import { useSEO } from '@/hooks/useSEO'

const GOLD = 'linear-gradient(135deg, #ecc46e 0%, #c8861e 35%, #f4dca8 55%, #a86a14 80%, #ecc46e 100%)'

export default function Wishlist() {
  const { t } = useTranslation()
  const { ids, toggle } = useWishlist()
  const { products } = useProducts()

  useSEO({ title: t('wishlist.title') })

  const wishlisted = products.filter(p => ids.includes(p.id))

  return (
    <div>
      {/* Header */}
      <div dir="ltr" className="relative bg-stone-950 dark:bg-black py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #c8861e 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-center text-center">
          <div className="w-px h-10 bg-brand-400/40 mb-6" />
          <p className="text-[10px] font-body uppercase tracking-[0.35em] text-brand-400/60 mb-3">My Selection</p>
          <h1
            className="font-serif font-light leading-none mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {t('wishlist.title')}
          </h1>
          <p className="font-body text-white/30 text-sm">
            {wishlisted.length === 0
              ? 'Your curated collection awaits'
              : `${wishlisted.length} ${wishlisted.length === 1 ? 'piece' : 'pieces'} saved`}
          </p>
          <div className="w-px h-10 bg-brand-400/40 mt-6" />
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
        {wishlisted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-8"
          >
            <div className="w-16 h-16 border border-stone-200 dark:border-stone-800 flex items-center justify-center">
              <Heart size={24} className="text-stone-300 dark:text-stone-600" />
            </div>
            <div className="text-center">
              <p className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-2">{t('wishlist.empty')}</p>
              <p className="font-body text-sm text-stone-400 max-w-xs">{t('wishlist.emptySubtitle')}</p>
            </div>
            <Link
              to="/shop"
              className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] border border-stone-300 dark:border-stone-700 px-8 py-3 text-stone-600 dark:text-stone-300 hover:border-brand-500 hover:text-brand-500 dark:hover:border-brand-400 dark:hover:text-brand-400 transition-colors"
            >
              {t('cart.shopNow')}
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {wishlisted.map((p, i) => (
              <div key={p.id} className="flex flex-col">
                <ProductCard product={p} index={i} />
                <button
                  onClick={() => toggle(p.id)}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 border border-stone-200 dark:border-stone-800 text-[10px] font-body uppercase tracking-[0.15em] text-stone-400 hover:border-brand-500 hover:text-brand-500 dark:hover:border-brand-400 dark:hover:text-brand-400 transition-colors"
                >
                  <X size={10} />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
