import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/cn'

import { GOLD } from '@/lib/constants'

const signInSchema = z.object({
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  password: z.string().min(6, 'passwordMin'),
})

const signUpSchema = signInSchema.extend({
  confirm: z.string().min(6, 'passwordMin'),
}).refine(d => d.password === d.confirm, { message: 'passwordMatch', path: ['confirm'] })

export function AuthModal({ open, onClose }) {
  const { t } = useTranslation()
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { addToast } = useToast()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: null })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    const schema = mode === 'signin' ? signInSchema : signUpSchema
    const result = schema.safeParse(form)
    if (!result.success) {
      const errs = {}
      result.error.errors.forEach(e => { errs[e.path[0]] = t(`auth.errors.${e.message}`) })
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const { error } = mode === 'signin'
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password)
      if (error) throw error
      addToast(t(mode === 'signin' ? 'auth.signInSuccess' : 'auth.signUpSuccess'))
      onClose()
    } catch (err) {
      addToast(err.message || t('auth.errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await signInWithGoogle()
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white dark:bg-stone-950 w-full sm:max-w-sm shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-8 pt-10 pb-6 border-b border-stone-100 dark:border-stone-800 text-center">
              <div className="w-px h-8 bg-brand-400/40 mx-auto mb-4" />
              <h2
                className="font-serif text-2xl font-light"
                style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
              </h2>
              <p className="text-[10px] font-body uppercase tracking-[0.25em] text-stone-400 mt-1">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </p>
              <button
                onClick={onClose}
                className="absolute top-4 end-4 text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-8 py-7 space-y-5">
              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border border-stone-200 dark:border-stone-700 px-4 py-3 text-xs font-body font-medium uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth.google')}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-100 dark:bg-stone-800" />
                <span className="text-[10px] font-body uppercase tracking-wider text-stone-400">{t('auth.orContinueWith')}</span>
                <div className="flex-1 h-px bg-stone-100 dark:bg-stone-800" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'email',    type: 'email',    label: t('auth.email') },
                  { key: 'password', type: 'password', label: t('auth.password') },
                  ...(mode === 'signup' ? [{ key: 'confirm', type: 'password', label: t('auth.confirmPassword') }] : []),
                ].map(({ key, type, label }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={e => set(key, e.target.value)}
                      className={cn(
                        'w-full text-sm font-body bg-transparent border px-4 py-3 outline-none transition-colors text-stone-800 dark:text-stone-100 placeholder-stone-400',
                        errors[key]
                          ? 'border-brand-400'
                          : 'border-stone-200 dark:border-stone-700 focus:border-stone-900 dark:focus:border-white'
                      )}
                    />
                    {errors[key] && (
                      <p className="text-[10px] font-body text-brand-500 mt-1 uppercase tracking-wider">{errors[key]}</p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? t('common.loading') : t(mode === 'signin' ? 'auth.signIn' : 'auth.signUp')}
                </button>
              </form>

              <p className="text-[11px] font-body text-center text-stone-400">
                {t(mode === 'signin' ? 'auth.noAccount' : 'auth.haveAccount')}{' '}
                <button
                  onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setErrors({}) }}
                  className="text-stone-700 dark:text-stone-300 hover:text-brand-500 dark:hover:text-brand-400 font-medium transition-colors"
                >
                  {t(mode === 'signin' ? 'auth.signUp' : 'auth.signIn')}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
