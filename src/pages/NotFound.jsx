import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { useSEO } from '@/hooks/useSEO'

export default function NotFound() {
  const { t } = useTranslation()
  useSEO({ title: t('common.notFound') })

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="font-serif text-[8rem] font-semibold text-stone-100 dark:text-stone-800 leading-none select-none">404</p>
        <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 -mt-4 mb-3">{t('common.notFound')}</h1>
        <p className="font-body text-stone-400 mb-8">{t('common.notFoundSub')}</p>
        <Link to="/"><Button>{t('common.goHome')}</Button></Link>
      </motion.div>
    </div>
  )
}
