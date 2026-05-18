import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { X, GitCompare } from 'lucide-react'
import { useCompare } from '@/context/CompareContext'
import { useCurrency } from '@/context/CurrencyContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

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
            initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 shadow-2xl px-4 py-3"
          >
            <div className="max-w-5xl mx-auto flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1 overflow-x-auto">
                {items.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl px-3 py-2 flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" onError={e => { e.target.src = 'https://placehold.co/32x32/stone/white?text=?' }} />
                    <span className="text-sm font-body font-medium text-stone-800 dark:text-stone-100 max-w-[100px] truncate">{p.name}</span>
                    <button onClick={() => toggle(p)} className="text-stone-400 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={clear}>{t('product.compare.clear')}</Button>
                <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5">
                  <GitCompare size={15} /> {t('product.compare.compare')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('product.compare.title')} className="max-w-4xl">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm font-body">
            <thead>
              <tr>
                <th className="text-start py-2 text-stone-400 font-medium w-36">{t('product.compare.specs')}</th>
                {items.map(p => (
                  <th key={p.id} className="text-center py-2 px-4">
                    <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded-xl mx-auto mb-2" onError={e => { e.target.src = 'https://placehold.co/80x80/stone/white?text=?' }} />
                    <p className="font-serif text-stone-900 dark:text-stone-100">{p.name}</p>
                    <p className="text-brand-500 font-semibold mt-1">{format(p.price)}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {allKeys.map(key => (
                <tr key={key}>
                  <td className="py-2.5 text-stone-500 font-medium">{key}</td>
                  {items.map(p => (
                    <td key={p.id} className="py-2.5 px-4 text-center text-stone-700 dark:text-stone-300">
                      {p.specs?.[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  )
}
