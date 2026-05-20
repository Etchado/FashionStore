import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { X, GitCompare } from 'lucide-react'
import { useCompare } from '@/context/CompareContext'
import { useCurrency } from '@/context/CurrencyContext'

import { GOLD } from '@/lib/constants'

export function CompareBar() {
  const { t } = useTranslation()
  const { items, toggle, clear, count } = useCompare()
  const { format } = useCurrency()
  const [modalOpen, setModalOpen] = useState(false)

  const allKeys = count > 0
    ? [...new Set(items.flatMap(p => Object.keys(p.specs || {})))]
    : []

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-stone-950 dark:bg-black border-t border-stone-800 shadow-2xl px-4 py-3"
          >
            <div className="max-w-5xl mx-auto flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1 overflow-x-auto">
                {items.map(p => (
                  <div key={p.id} className="flex items-center gap-2.5 border border-stone-800 px-3 py-2 flex-shrink-0">
                    <div className="w-8 h-10 overflow-hidden bg-stone-800 flex-shrink-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://placehold.co/32x40/1c1917/c8861e?text=?' }}
                      />
                    </div>
                    <span className="text-xs font-body text-white max-w-[100px] truncate">{p.name}</span>
                    <button
                      onClick={() => toggle(p)}
                      className="text-stone-600 hover:text-white transition-colors flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={clear}
                  className="text-[10px] font-body uppercase tracking-wider text-stone-500 hover:text-white transition-colors"
                >
                  {t('product.compare.clear')}
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-400 hover:text-white transition-colors"
                >
                  <GitCompare size={13} />
                  {t('product.compare.compare')} ({count})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white dark:bg-stone-950 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
                <h2 className="font-serif text-lg font-light text-stone-900 dark:text-stone-100">
                  {t('product.compare.title')}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-auto flex-1 p-6">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr>
                      <th className="text-start py-3 pe-6 text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 w-36 align-bottom">
                        {t('product.compare.specs')}
                      </th>
                      {items.map(p => (
                        <th key={p.id} className="text-center py-3 px-4 align-bottom">
                          <div className="w-20 h-24 overflow-hidden mx-auto mb-3 bg-stone-100 dark:bg-stone-900">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.src = 'https://placehold.co/80x96/e7e5e4/78716c?text=?' }}
                            />
                          </div>
                          <p className="text-[10px] font-body uppercase tracking-wider text-stone-400 mb-0.5">{p.brand}</p>
                          <p className="font-serif text-stone-900 dark:text-stone-100 text-sm leading-snug">{p.name}</p>
                          <p
                            className="font-serif text-base font-light mt-1"
                            style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                          >
                            {format(p.price)}
                          </p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {allKeys.length === 0 ? (
                      <tr>
                        <td colSpan={items.length + 1} className="py-8 text-center text-stone-400 text-sm">
                          No specs available for these products
                        </td>
                      </tr>
                    ) : allKeys.map(key => (
                      <tr key={key}>
                        <td className="py-3 pe-6 text-[10px] font-body font-semibold uppercase tracking-wider text-stone-400 align-top">
                          {key}
                        </td>
                        {items.map(p => (
                          <td key={p.id} className="py-3 px-4 text-center text-sm text-stone-600 dark:text-stone-300">
                            {p.specs?.[key] || <span className="text-stone-300 dark:text-stone-700">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
