import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { Button } from '@/components/ui/Button'
import { useEffect } from 'react'

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel — slides from end */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="absolute end-0 inset-y-0 w-full max-w-sm bg-white dark:bg-stone-950 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-stone-700 dark:text-stone-200" />
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-100">{t('cart.title')}</h2>
                {count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-body font-semibold bg-brand-500 text-white rounded-full">{count}</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors rounded-lg" aria-label={t('common.close')}>
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                    <ShoppingBag size={40} className="text-stone-200 dark:text-stone-700" />
                    <p className="font-serif text-lg text-stone-900 dark:text-stone-100">{t('cart.empty')}</p>
                    <p className="font-body text-sm text-stone-400">{t('cart.emptySubtitle')}</p>
                    <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>{t('cart.shopNow')}</Button>
                  </div>
                )
                : items.map(item => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3"
                  >
                    <div className="w-18 h-20 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image} alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://placehold.co/72x80/e7e5e4/78716c?text=?' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body text-stone-400">{item.brand}</p>
                      <p className="text-sm font-body font-medium text-stone-900 dark:text-stone-100 line-clamp-2">{item.name}</p>
                      {item.variantLabel && <p className="text-xs font-body text-stone-400">{item.variantLabel}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 border border-stone-200 dark:border-stone-700 rounded-full px-2 py-0.5">
                          <button onClick={() => updateQty(item.key, item.qty - 1)} className="p-0.5 text-stone-500 hover:text-brand-500 transition-colors"><Minus size={12} /></button>
                          <span className="text-sm font-body w-5 text-center text-stone-800 dark:text-stone-100">{item.qty}</span>
                          <button onClick={() => updateQty(item.key, item.qty + 1)} className="p-0.5 text-stone-500 hover:text-brand-500 transition-colors"><Plus size={12} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-body font-semibold text-stone-900 dark:text-stone-100">{format(item.price * item.qty)}</span>
                          <button onClick={() => removeItem(item.key)} className="text-stone-300 hover:text-red-500 dark:text-stone-600 dark:hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-stone-200 dark:border-stone-800 px-5 py-4 space-y-4">
                {freeShipping
                  ? <p className="text-xs font-body text-emerald-500 font-medium text-center">🎉 {t('cart.freeShippingNote')}</p>
                  : <p className="text-xs font-body text-stone-400 text-center">{t('cart.freeShipping')}: add {format(150 - subtotal)} more</p>
                }
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{t('cart.subtotal')}</span>
                  <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{format(subtotal)}</span>
                </div>
                <Link to="/checkout" onClick={() => setOpen(false)}>
                  <Button className="w-full">{t('cart.checkout')}</Button>
                </Link>
                <button onClick={() => setOpen(false)} className="w-full text-sm font-body text-stone-400 hover:text-stone-600 transition-colors">
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
