import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/cn'

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
      setErrors(errs); return
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

  const field = (key, type = 'text', placeholder) => (
    <div>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full text-sm font-body bg-stone-50 dark:bg-stone-800 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-400 text-stone-800 dark:text-stone-100 placeholder-stone-400 transition-all',
          errors[key] ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'
        )}
      />
      {errors[key] && <p className="text-xs font-body text-red-400 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} className="max-w-sm" title={t(mode === 'signin' ? 'auth.signIn' : 'auth.signUp')}>
      <div className="p-6 space-y-4">
        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm font-body font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t('auth.google')}
        </button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-stone-200 dark:border-stone-700" />
          <span className="text-xs font-body text-stone-400">{t('auth.orContinueWith')}</span>
          <hr className="flex-1 border-stone-200 dark:border-stone-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {field('email', 'email', t('auth.email'))}
          {field('password', 'password', t('auth.password'))}
          {mode === 'signup' && field('confirm', 'password', t('auth.confirmPassword'))}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('common.loading') : t(mode === 'signin' ? 'auth.signIn' : 'auth.signUp')}
          </Button>
        </form>

        <p className="text-xs font-body text-center text-stone-500">
          {t(mode === 'signin' ? 'auth.noAccount' : 'auth.haveAccount')}{' '}
          <button
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setErrors({}) }}
            className="text-brand-500 hover:text-brand-600 font-medium"
          >
            {t(mode === 'signin' ? 'auth.signUp' : 'auth.signIn')}
          </button>
        </p>
      </div>
    </Modal>
  )
}
