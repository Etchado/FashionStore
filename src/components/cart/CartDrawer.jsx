import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useEffect } from 'react'

const GOLD = 'linear-gradient(135deg, #ecc46e 0%, #c8861e 35%, #f4dca8 55%, #a86a14 80%, #ecc46e 100%)'

export function CartDrawer() {
  const { t } = useTranslation()
  const { items, open, setOpen, removeItem, updateQty, count, subtotal } = useCart()
  const { format } = useCurrency()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setOpen])

  const freeShipping = subtotal >= 150
  const shippingProgress = Math.min((subtotal / 150) * 100, 100)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="absolute end-0 inset-y-0 w-full max-w-[380px] bg-white dark:bg-stone-950 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-lg font-light text-stone-900 dark:text-stone-100">{t('cart.title')}</h2>
                {count > 0 && (
                  <span className="text-[10px] font-body font-semibold uppercase tracking-wider text-stone-400">
                    ({count})
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Free shipping progress */}
            {items.length > 0 && (
              <div className="px-6 py-3 border-b border-stone-100 dark:border-stone-800">
                {freeShipping ? (
                  <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-brand-500 text-center">
                    ✦ Free shipping unlocked
                  </p>
                ) : (
                  <div>
                    <p className="text-[10px] font-body text-stone-400 text-center mb-2">
                      Add {format(150 - subtotal)} more for free shipping
                    </p>
                    <div className="h-px bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full bg-brand-400 transition-all duration-500"
                        style={{ width: `${shippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 py-16 px-6">
                  <div className="w-14 h-14 border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                    <ShoppingBag size={22} className="text-stone-300 dark:text-stone-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-1">{t('cart.empty')}</p>
                    <p className="font-body text-sm text-stone-400">{t('cart.emptySubtitle')}</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] border border-stone-300 dark:border-stone-700 px-6 py-3 text-stone-600 dark:text-stone-300 hover:border-brand-500 hover:text-brand-500 transition-colors"
                  >
                    {t('cart.shopNow')}
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      className="flex gap-4 px-6 py-4 border-b border-stone-50 dark:border-stone-900"
                    >
                      <Link to={`/product/${item.id}`} onClick={() => setOpen(false)} className="flex-shrink-0">
                        <div className="w-16 h-20 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                          <img
                            src={item.image} alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'https://placehold.co/64x80/e7e5e4/78716c?text=?' }}
                          />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider mb-0.5">{item.brand}</p>
                        <p className="text-sm font-body font-medium text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">{item.name}</p>
                        {item.variantLabel && (
                          <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider mt-0.5">{item.variantLabel}</p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty controls */}
                          <div className="flex items-center border border-stone-200 dark:border-stone-700">
                            <button
                              onClick={() => updateQty(item.key, item.qty - 1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-7 text-center text-xs font-body text-stone-800 dark:text-stone-100">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.key, item.qty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-body font-medium text-stone-900 dark:text-stone-100">
                              {format(item.price * item.qty)}
                            </span>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="text-stone-300 dark:text-stone-700 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-stone-100 dark:border-stone-800 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400">{t('cart.subtotal')}</span>
                  <span
                    className="font-serif text-xl font-light"
                    style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {format(subtotal)}
                  </span>
                </div>

                <Link to="/checkout" onClick={() => setOpen(false)}>
                  <button className="w-full py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors">
                    {t('cart.checkout')}
                  </button>
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full text-[10px] font-body uppercase tracking-wider text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors py-1"
                >
                  {t('cart.continueShopping')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
