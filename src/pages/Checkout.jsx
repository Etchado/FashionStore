import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { z } from 'zod'
import { Check, ShoppingBag, Truck, CreditCard } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

import { GOLD } from '@/lib/constants'

function generateOrderNumber() {
  return `AU-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

const shippingSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Invalid phone'),
  address: z.string().min(5, 'Required'),
  city: z.string().min(2, 'Required'),
  state: z.string().min(1, 'Required'),
  zip: z.string().min(3, 'Required'),
  country: z.string().min(2, 'Required'),
})

const STEPS = [
  { key: 'cart',     label: 'Review',   icon: ShoppingBag },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment',  label: 'Payment',  icon: CreditCard },
]

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-[10px] font-body text-brand-500 mt-1 uppercase tracking-wider">{error}</p>}
    </div>
  )
}

export default function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { format } = useCurrency()
  const { addToast } = useToast()

  useSEO({ title: t('checkout.title') })

  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: user?.email || '',
    phone: '', address: '', city: '', state: '', zip: '', country: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)

  const shippingTotal = subtotal >= 150 ? 0 : 15
  const total = subtotal + shippingTotal

  const setField = (key, val) => {
    setShipping(s => ({ ...s, [key]: val }))
    setErrors(e => ({ ...e, [key]: null }))
  }

  const validateShipping = () => {
    const result = shippingSchema.safeParse(shipping)
    if (!result.success) {
      const errs = {}
      result.error.errors.forEach(e => { errs[e.path[0]] = e.message })
      setErrors(errs)
      return false
    }
    return true
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
      const num = generateOrderNumber()
      const lineItems = items.map(i => ({
        product_id: i.productId,
        name: i.name,
        variant_label: i.variantLabel || null,
        price: i.price,
        qty: i.qty,
      }))

      const { data: order, error } = await supabase.rpc('place_order', {
        p_user_id:      user?.id ?? null,
        p_order_number: num,
        p_total:        total,
        p_shipping:     shipping,
        p_items:        lineItems,
      })

      if (error) throw error

      setOrderNumber(order.order_number)
      clearCart()
      setStep(3)
    } catch {
      addToast(t('toast.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (key) => cn(
    'w-full text-sm font-body bg-transparent border px-4 py-3 outline-none transition-colors text-stone-800 dark:text-stone-100 placeholder-stone-400',
    errors[key]
      ? 'border-brand-400'
      : 'border-stone-200 dark:border-stone-700 focus:border-stone-900 dark:focus:border-white'
  )

  if (items.length === 0 && step < 3) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 border border-stone-200 dark:border-stone-800 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={24} className="text-stone-300 dark:text-stone-600" />
        </div>
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-6">{t('cart.empty')}</h2>
        <button
          onClick={() => navigate('/shop')}
          className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] border border-stone-300 dark:border-stone-700 px-8 py-3 text-stone-600 dark:text-stone-300 hover:border-brand-500 hover:text-brand-500 transition-colors"
        >
          {t('cart.shopNow')}
        </button>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="w-20 h-20 border border-brand-400/40 flex items-center justify-center mx-auto mb-8">
            <Check size={32} className="text-brand-400" />
          </div>
        </motion.div>
        <h1 className="font-serif text-3xl font-light text-stone-900 dark:text-stone-100 mb-3">
          {t('checkout.success.title')}
        </h1>
        <p className="font-body text-stone-400 mb-2 text-sm">{t('checkout.success.subtitle', { number: orderNumber })}</p>
        <p
          className="font-serif text-xl font-light mb-10"
          style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          {orderNumber}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/account')}
            className="px-8 py-3 border border-stone-300 dark:border-stone-700 text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-600 dark:text-stone-300 hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            {t('checkout.success.viewOrders')}
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors"
          >
            {t('checkout.success.continueShopping')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-body uppercase tracking-[0.3em] text-stone-400 mb-2">Secure checkout</p>
        <h1 className="font-serif text-3xl font-light text-stone-900 dark:text-stone-100">{t('checkout.title')}</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-10 max-w-sm">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className={cn(
              'w-8 h-8 flex items-center justify-center text-[10px] font-body font-semibold transition-colors',
              i < step
                ? 'bg-brand-500 text-white'
                : i === step
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                  : 'border border-stone-200 dark:border-stone-700 text-stone-400'
            )}>
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <div className="ms-2 hidden sm:block flex-shrink-0">
              <p className={cn('text-[9px] font-body uppercase tracking-wider', i <= step ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400')}>
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-4 transition-colors', i < step ? 'bg-brand-500' : 'bg-stone-200 dark:bg-stone-700')} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 0: Cart review */}
            {step === 0 && (
              <motion.div key="cart" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400 mb-6">Review your order</p>
                <div className="space-y-4 mb-8">
                  {items.map(item => (
                    <div key={item.key} className="flex gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                      <div className="w-16 h-20 overflow-hidden bg-stone-100 dark:bg-stone-900 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.src = 'https://placehold.co/64x80/e7e5e4/78716c?text=?' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider">{item.brand}</p>
                        <p className="font-body text-sm font-medium text-stone-900 dark:text-stone-100 leading-snug">{item.name}</p>
                        {item.variantLabel && <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider mt-0.5">{item.variantLabel}</p>}
                        <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider mt-1">Qty: {item.qty}</p>
                      </div>
                      <span className="font-body font-medium text-stone-900 dark:text-stone-100 flex-shrink-0">{format(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors"
                >
                  Continue to Shipping →
                </button>
              </motion.div>
            )}

            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.div key="shipping" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400 mb-6">{t('checkout.shipping.title')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { key: 'firstName', label: t('checkout.shipping.firstName') },
                    { key: 'lastName',  label: t('checkout.shipping.lastName') },
                  ].map(({ key, label }) => (
                    <Field key={key} label={label} error={errors[key]}>
                      <input value={shipping[key]} onChange={e => setField(key, e.target.value)} className={inputCls(key)} />
                    </Field>
                  ))}
                  {[
                    { key: 'email', label: t('checkout.shipping.email'), type: 'email' },
                    { key: 'phone', label: t('checkout.shipping.phone'), type: 'tel' },
                  ].map(({ key, label, type }) => (
                    <Field key={key} label={label} error={errors[key]}>
                      <input type={type} value={shipping[key]} onChange={e => setField(key, e.target.value)} className={inputCls(key)} />
                    </Field>
                  ))}
                  <div className="sm:col-span-2">
                    <Field label={t('checkout.shipping.address')} error={errors.address}>
                      <input value={shipping.address} onChange={e => setField('address', e.target.value)} className={inputCls('address')} />
                    </Field>
                  </div>
                  {[
                    { key: 'city',    label: t('checkout.shipping.city') },
                    { key: 'state',   label: t('checkout.shipping.state') },
                    { key: 'zip',     label: t('checkout.shipping.zip') },
                    { key: 'country', label: t('checkout.shipping.country') },
                  ].map(({ key, label }) => (
                    <Field key={key} label={label} error={errors[key]}>
                      <input value={shipping[key]} onChange={e => setField(key, e.target.value)} className={inputCls(key)} />
                    </Field>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="px-6 py-3.5 border border-stone-200 dark:border-stone-700 text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-600 dark:text-stone-300 hover:border-stone-400 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => { if (validateShipping()) setStep(2) }}
                    className="px-8 py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div key="payment" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400 mb-6">{t('checkout.payment.title')}</p>
                <div className="border border-brand-400/30 bg-brand-50/30 dark:bg-stone-900 p-4 mb-6">
                  <p className="text-sm font-body text-stone-600 dark:text-stone-300">{t('checkout.payment.note')}</p>
                </div>
                <div className="space-y-4 mb-8">
                  {[['Card Number', '4242 4242 4242 4242'], ['Expiry', '12/28'], ['CVV', '···']].map(([lbl, ph]) => (
                    <Field key={lbl} label={lbl}>
                      <input placeholder={ph} readOnly className="w-full text-sm font-body bg-transparent border border-stone-200 dark:border-stone-700 px-4 py-3 outline-none text-stone-400 cursor-not-allowed" />
                    </Field>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 border border-stone-200 dark:border-stone-700 text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-600 dark:text-stone-300 hover:border-stone-400 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="px-8 py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? t('common.loading') : t('checkout.payment.placeOrder')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="border border-stone-200 dark:border-stone-800 p-6 h-fit space-y-5">
          <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400">Order Summary</p>
          <div className="space-y-3">
            {items.map(i => (
              <div key={i.key} className="flex justify-between gap-4">
                <span className="text-sm font-body text-stone-500 dark:text-stone-400 truncate">{i.name} ×{i.qty}</span>
                <span className="text-sm font-body text-stone-700 dark:text-stone-200 flex-shrink-0">{format(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-2">
            <div className="flex justify-between text-sm font-body text-stone-400">
              <span>{t('cart.subtotal')}</span><span>{format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-body text-stone-400">
              <span>{t('cart.shipping')}</span>
              <span>{shippingTotal === 0 ? 'Free' : format(shippingTotal)}</span>
            </div>
          </div>
          <div className="border-t border-stone-200 dark:border-stone-800 pt-4 flex justify-between items-baseline">
            <span className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-stone-400">{t('cart.total')}</span>
            <span
              className="font-serif text-2xl font-light"
              style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {format(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
