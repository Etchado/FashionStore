import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

export function CookieBanner() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('cookie-consent'))

  const accept = (type) => {
    localStorage.setItem('cookie-consent', type)
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 shadow-2xl px-4 py-4"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-body font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('cookie.title')}</p>
              <p className="font-body text-stone-500 dark:text-stone-400 text-xs mt-0.5">{t('cookie.message')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={() => accept('essential')}>{t('cookie.essentialOnly')}</Button>
              <Button size="sm" onClick={() => accept('all')}>{t('cookie.acceptAll')}</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
