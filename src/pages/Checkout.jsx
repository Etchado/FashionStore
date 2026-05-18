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
import { Button } from '@/components/ui/Button'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

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

const STEPS = ['cart', 'shipping', 'payment']

export default function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { format } = useCurrency()
  const { addToast } = useToast()

  useSEO({ title: t('checkout.title') })

  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({ firstName: '', lastName: '', email: user?.email || '', phone: '', address: '', city: '', state: '', zip: '', country: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)

  const shippingTotal = subtotal >= 150 ? 0 : 15
  const total = subtotal + shippingTotal

  const setField = (key, val) => { setShipping(s => ({ ...s, [key]: val })); setErrors(e => ({ ...e, [key]: null })) }

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
      const num = `AU-${Date.now().toString().slice(-6)}`
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id,
        order_number: num,
        status: 'paid',
        total,
        shipping_info: shipping,
      }).select().single()

      if (error) throw error

      if (order) {
        const lineItems = items.map(i => ({
          order_id: order.id,
          product_id: i.productId,
          name: i.name,
          variant_label: i.variantLabel,
          price: i.price,
          qty: i.qty,
        }))
        await supabase.from('order_items').insert(lineItems)

        if (user) {
          const pts = Math.floor(total / 10)
          await supabase.from('loyalty_points').upsert({ user_id: user.id, points: pts }, { onConflict: 'user_id' })
        }
      }

      setOrderNumber(num)
      clearCart()
      setStep(3)
    } catch {
      addToast(t('toast.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const stepIcons = [ShoppingBag, Truck, CreditCard]

  if (items.length === 0 && step < 3) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={48} className="text-stone-200 dark:text-stone-700 mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-4">{t('cart.empty')}</h2>
        <Button onClick={() => navigate('/shop')}>{t('cart.shopNow')}</Button>
      </div>
    )
  }

  // Success
  if (step === 3) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-emerald-500" />
          </div>
        </motion.div>
        <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 mb-3">{t('checkout.success.title')}</h1>
        <p className="font-body text-stone-500 mb-8">{t('checkout.success.subtitle', { number: orderNumber })}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/account')}>{t('checkout.success.viewOrders')}</Button>
          <Button onClick={() => navigate('/shop')}>{t('checkout.success.continueShopping')}</Button>
        </div>
      </div>
    )
  }

  const inputCls = (key) => cn(
    'w-full text-sm font-body bg-stone-50 dark:bg-stone-800 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-400 text-stone-800 dark:text-stone-100 placeholder-stone-400 transition-all',
    errors[key] ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 mb-8">{t('checkout.title')}</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10 max-w-md">
        {STEPS.map((s, i) => {
          const Icon = stepIcons[i]
          return (
            <div key={s} className="flex items-center flex-1">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-colors',
                i < step ? 'bg-brand-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
              )}>
                {i < step ? <Check size={14} /> : <Icon size={14} />}
              </div>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 transition-colors', i < step ? 'bg-brand-500' : 'bg-stone-200 dark:bg-stone-700')} />}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Cart review */}
            {step === 0 && (
              <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="font-body font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('checkout.steps.cart')}</h2>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.key} className="flex gap-3 bg-stone-50 dark:bg-stone-900 rounded-xl p-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" onError={e => { e.target.src = 'https://placehold.co/64x64/e7e5e4/78716c?text=?' }} />
                      <div className="flex-1">
                        <p className="font-body text-sm font-medium text-stone-900 dark:text-stone-100">{item.name}</p>
                        {item.variantLabel && <p className="text-xs font-body text-stone-400">{item.variantLabel}</p>}
                        <p className="text-xs font-body text-stone-400">Qty: {item.qty}</p>
                      </div>
                      <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{format(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <Button className="mt-6" onClick={() => setStep(1)}>
                  {t('checkout.steps.shipping')} →
                </Button>
              </motion.div>
            )}

            {/* Shipping */}
            {step === 1 && (
              <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="font-body font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('checkout.shipping.title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[['firstName', t('checkout.shipping.firstName')], ['lastName', t('checkout.shipping.lastName')]].map(([k, lbl]) => (
                    <div key={k}>
                      <label className="text-xs font-body text-stone-500 mb-1 block">{lbl}</label>
                      <input value={shipping[k]} onChange={e => setField(k, e.target.value)} className={inputCls(k)} />
                      {errors[k] && <p className="text-xs text-red-400 mt-0.5">{errors[k]}</p>}
                    </div>
                  ))}
                  {[['email', t('checkout.shipping.email'), 'email'], ['phone', t('checkout.shipping.phone'), 'tel']].map(([k, lbl, type]) => (
                    <div key={k}>
                      <label className="text-xs font-body text-stone-500 mb-1 block">{lbl}</label>
                      <input type={type} value={shipping[k]} onChange={e => setField(k, e.target.value)} className={inputCls(k)} />
                      {errors[k] && <p className="text-xs text-red-400 mt-0.5">{errors[k]}</p>}
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-body text-stone-500 mb-1 block">{t('checkout.shipping.address')}</label>
                    <input value={shipping.address} onChange={e => setField('address', e.target.value)} className={inputCls('address')} />
                    {errors.address && <p className="text-xs text-red-400 mt-0.5">{errors.address}</p>}
                  </div>
                  {[['city', t('checkout.shipping.city')], ['state', t('checkout.shipping.state')], ['zip', t('checkout.shipping.zip')], ['country', t('checkout.shipping.country')]].map(([k, lbl]) => (
                    <div key={k}>
                      <label className="text-xs font-body text-stone-500 mb-1 block">{lbl}</label>
                      <input value={shipping[k]} onChange={e => setField(k, e.target.value)} className={inputCls(k)} />
                      {errors[k] && <p className="text-xs text-red-400 mt-0.5">{errors[k]}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="secondary" onClick={() => setStep(0)}>← {t('common.prev')}</Button>
                  <Button onClick={() => { if (validateShipping()) setStep(2) }}>{t('checkout.shipping.continue')}</Button>
                </div>
              </motion.div>
            )}

            {/* Payment */}
            {step === 2 && (
              <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="font-body font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('checkout.payment.title')}</h2>
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                  <p className="text-sm font-body text-amber-700 dark:text-amber-300">{t('checkout.payment.note')}</p>
                </div>
                <div className="space-y-3 mb-6">
                  {[['Card Number', '4242 4242 4242 4242'], ['Expiry', '12/28'], ['CVV', '123']].map(([lbl, ph]) => (
                    <div key={lbl}>
                      <label className="text-xs font-body text-stone-500 mb-1 block">{lbl}</label>
                      <input placeholder={ph} className="w-full text-sm font-body bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 outline-none text-stone-400 cursor-not-allowed" readOnly />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)}>← {t('common.prev')}</Button>
                  <Button onClick={placeOrder} disabled={loading}>
                    {loading ? t('common.loading') : t('checkout.payment.placeOrder')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-6 h-fit space-y-4">
          <h3 className="font-body font-semibold text-stone-900 dark:text-stone-100">Order Summary</h3>
          <div className="space-y-2">
            {items.map(i => (
              <div key={i.key} className="flex justify-between text-sm font-body text-stone-600 dark:text-stone-300">
                <span className="truncate me-2">{i.name} ×{i.qty}</span>
                <span className="flex-shrink-0">{format(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <hr className="border-stone-200 dark:border-stone-700" />
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between text-stone-500"><span>{t('cart.subtotal')}</span><span>{format(subtotal)}</span></div>
            <div className="flex justify-between text-stone-500"><span>{t('cart.shipping')}</span><span>{shippingTotal === 0 ? t('cart.freeShipping') : format(shippingTotal)}</span></div>
            <hr className="border-stone-200 dark:border-stone-700" />
            <div className="flex justify-between font-semibold text-stone-900 dark:text-stone-100 text-base"><span>{t('cart.total')}</span><span>{format(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
