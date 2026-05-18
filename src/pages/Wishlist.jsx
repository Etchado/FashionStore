import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '@/context/WishlistContext'
import { useProducts } from '@/context/ProductsContext'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/Button'
import { useSEO } from '@/hooks/useSEO'

export default function Wishlist() {
  const { t } = useTranslation()
  const { ids } = useWishlist()
  const { products } = useProducts()

  useSEO({ title: t('wishlist.title') })

  const wishlisted = products.filter(p => ids.includes(p.id))

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 mb-10">{t('wishlist.title')}</h1>

      {wishlisted.length === 0
        ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Heart size={48} className="text-stone-200 dark:text-stone-700" />
            <p className="font-serif text-xl text-stone-900 dark:text-stone-100">{t('wishlist.empty')}</p>
            <p className="font-body text-sm text-stone-400">{t('wishlist.emptySubtitle')}</p>
            <Link to="/shop"><Button>{t('cart.shopNow')}</Button></Link>
          </div>
        )
        : <ProductGrid products={wishlisted} loading={false} />
      }
    </div>
  )
}
