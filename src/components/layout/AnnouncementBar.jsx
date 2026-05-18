import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MESSAGES = ['msg1', 'msg2', 'msg3', 'msg4']

export function AnnouncementBar() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('ann-dismissed') === '1')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (dismissed) return
    const interval = setInterval(() => setIdx(i => (i + 1) % MESSAGES.length), 4000)
    return () => clearInterval(interval)
  }, [dismissed])

  if (dismissed) return null

  return (
    <div className="bg-brand-500 text-white h-announcement flex items-center justify-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-xs font-body font-medium tracking-wide text-center px-10"
        >
          {t(`announcement.${MESSAGES[idx]}`)}
        </motion.p>
      </AnimatePresence>
      <button
        onClick={() => { setDismissed(true); sessionStorage.setItem('ann-dismissed', '1') }}
        className="absolute end-3 text-white/70 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
