import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useSEO } from '@/hooks/useSEO'
import { useTranslation } from 'react-i18next'

const GOLD = 'linear-gradient(135deg, #ecc46e 0%, #c8861e 35%, #f4dca8 55%, #a86a14 80%, #ecc46e 100%)'

export default function NotFound() {
  const { t } = useTranslation()
  useSEO({ title: '404 — Page Not Found' })

  return (
    <div dir="ltr" className="min-h-[80vh] bg-stone-950 dark:bg-black flex flex-col items-center justify-center px-4 text-center">
      {/* Halftone dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #c8861e 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Big 404 */}
        <div
          className="font-serif font-light leading-none select-none mb-2"
          style={{
            fontSize: 'clamp(7rem, 20vw, 14rem)',
            background: GOLD,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.2,
          }}
        >
          404
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-6 -mt-4">
          <div className="h-px w-12 bg-brand-400/40" />
          <span className="text-brand-400 text-xs">✦</span>
          <div className="h-px w-12 bg-brand-400/40" />
        </div>

        <h1 className="font-serif text-2xl font-light text-white mb-3">
          {t('common.notFound')}
        </h1>
        <p className="font-body text-sm text-white/30 mb-10 max-w-xs mx-auto leading-relaxed">
          {t('common.notFoundSub')}
        </p>

        <Link
          to="/"
          className="inline-block text-[10px] font-body font-semibold uppercase tracking-[0.25em] border border-brand-400/40 text-brand-300 px-8 py-3 hover:bg-brand-400/10 hover:border-brand-400 transition-all duration-300"
        >
          {t('common.goHome')}
        </Link>
      </motion.div>
    </div>
  )
}
