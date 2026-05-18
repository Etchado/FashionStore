import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Modal({ open, onClose, children, className, title }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn('relative bg-white dark:bg-stone-950 shadow-2xl w-full max-h-[90vh] overflow-y-auto', className)}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
                <h2 className="font-serif text-lg font-light text-stone-900 dark:text-stone-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 end-4 z-10 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
