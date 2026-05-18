import { AnimatePresence, motion } from 'motion/react'
import { useToast } from '@/context/ToastContext'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function ToastStack() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-6 end-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl rounded-xl px-4 py-3 min-w-[260px] max-w-sm"
          >
            {toast.type === 'success'
              ? <CheckCircle size={18} className="text-emerald-500 shrink-0" />
              : <XCircle size={18} className="text-red-500 shrink-0" />
            }
            <span className="flex-1 text-sm font-body text-stone-800 dark:text-stone-100">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
