import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, Star, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/context/CurrencyContext'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

import { GOLD, LOYALTY_TIERS } from '@/lib/constants'

const STATUS_STYLE = {
  pending:    'border-stone-300 text-stone-500',
  paid:       'border-stone-700 text-stone-300 dark:border-stone-400 dark:text-stone-400',
  processing: 'border-brand-400/50 text-brand-500',
  shipped:    'border-brand-500 text-brand-400',
  delivered:  'border-stone-900 dark:border-white text-stone-900 dark:text-white',
  cancelled:  'border-stone-300 text-stone-400 line-through',
}

export default function Account() {
  const { t } = useTranslation()
  const { user, loading } = useAuth()
  const { format } = useCurrency()
  const [orders, setOrders] = useState([])
  const [loyalty, setLoyalty] = useState(null)
  const [tab, setTab] = useState('orders')

  useSEO({ title: t('account.title') })

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const [{ data: o }, { data: l }] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('loyalty_points').select('*').eq('user_id', user.id).single(),
      ])
      if (o) setOrders(o)
      if (l) setLoyalty(l)
    }
    fetchData()
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/" replace />

  const points = loyalty?.points || 0
  const tierIndex = LOYALTY_TIERS.reduce((idx, t, i) => points >= t.min ? i : idx, 0)
  const tier = LOYALTY_TIERS[tierIndex]
  const nextTier = LOYALTY_TIERS[tierIndex + 1]
  const tierProgress = nextTier
    ? Math.min(((points - tier.min) / (nextTier.min - tier.min)) * 100, 100)
    : 100

  const tabs = [
    { key: 'orders',  label: t('account.orders'),  icon: Package },
    { key: 'loyalty', label: t('account.loyalty'),  icon: Star },
    { key: 'profile', label: t('account.profile'),  icon: UserIcon },
  ]

  return (
    <div>
      {/* Header */}
      <div dir="ltr" className="relative bg-stone-950 dark:bg-black border-b border-stone-900">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-body uppercase tracking-[0.3em] text-brand-400/60 mb-2">My Account</p>
            <h1 className="font-serif text-3xl font-light text-white mb-1">{t('account.title')}</h1>
            <p className="text-sm font-body text-stone-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] px-3 py-1 border border-brand-400/30 text-brand-400"
            >
              {tier.name}
            </span>
            <span className="text-[10px] font-body text-stone-500">{points.toLocaleString()} pts</span>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-0 mb-10 border-b border-stone-200 dark:border-stone-800">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] border-b-2 -mb-px transition-colors',
                tab === key
                  ? 'border-stone-900 dark:border-white text-stone-900 dark:text-white'
                  : 'border-transparent text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              )}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                  <Package size={20} className="text-stone-300 dark:text-stone-600" />
                </div>
                <p className="font-body text-stone-400 text-sm">{t('account.noOrders')}</p>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="border border-stone-200 dark:border-stone-800 p-5">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <p className="font-body font-medium text-stone-900 dark:text-stone-100 mb-0.5">
                      {t('account.orderNumber', { number: order.order_number })}
                    </p>
                    <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider">
                      {t('account.orderDate', { date: new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      'text-[10px] font-body font-semibold uppercase tracking-wider px-2.5 py-1 border',
                      STATUS_STYLE[order.status] || STATUS_STYLE.pending
                    )}>
                      {t(`account.orderStatus.${order.status}`)}
                    </span>
                    <span
                      className="font-serif text-lg font-light"
                      style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >
                      {format(order.total)}
                    </span>
                  </div>
                </div>
                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm font-body">
                        <span className="text-stone-500 dark:text-stone-400">
                          {item.name} {item.variant_label ? `(${item.variant_label})` : ''} × {item.qty}
                        </span>
                        <span className="text-stone-700 dark:text-stone-300">{format(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── LOYALTY TAB ── */}
        {tab === 'loyalty' && (
          <div>
            <div className="border border-stone-200 dark:border-stone-800 p-8 text-center mb-6">
              <p className="text-[10px] font-body uppercase tracking-[0.3em] text-stone-400 mb-4">Your Tier</p>
              <div
                className="font-serif text-5xl font-light mb-2"
                style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {tier.name}
              </div>
              <p className="font-body text-stone-400 text-sm mb-8">
                {t('account.loyalty.points', { points: points.toLocaleString() })}
              </p>

              {/* Progress bar */}
              {nextTier && (
                <div className="max-w-sm mx-auto mb-8">
                  <div className="flex justify-between text-[10px] font-body uppercase tracking-wider text-stone-400 mb-2">
                    <span>{tier.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                  <div className="h-px bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
                      style={{ width: `${tierProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-body text-stone-400 mt-2 text-center">
                    {(nextTier.min - points).toLocaleString()} pts to {nextTier.name}
                  </p>
                </div>
              )}

              {/* Tier breakdown */}
              <div className="grid grid-cols-4 gap-4 border-t border-stone-100 dark:border-stone-800 pt-8">
                {LOYALTY_TIERS.map((t2) => (
                  <div key={t2.name} className="text-center">
                    <p className={cn(
                      'text-[10px] font-body font-semibold uppercase tracking-wider mb-1',
                      t2.name === tier.name ? 'text-brand-500' : 'text-stone-400'
                    )}>
                      {t2.name}
                    </p>
                    <p className="text-[9px] font-body text-stone-500">{t2.min.toLocaleString()}+</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm font-body text-stone-400 text-center">{t('account.loyalty.earnMore')}</p>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="border border-stone-200 dark:border-stone-800 p-6 space-y-6">
            <div>
              <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-2">
                {t('auth.email')}
              </p>
              <p className="font-body text-stone-800 dark:text-stone-100">{user.email}</p>
            </div>
            <div className="border-t border-stone-100 dark:border-stone-800 pt-6">
              <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-2">
                Account ID
              </p>
              <p className="font-body text-stone-400 text-sm font-mono">{user.id}</p>
            </div>
            <div className="border-t border-stone-100 dark:border-stone-800 pt-6">
              <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-2">
                Member since
              </p>
              <p className="font-body text-stone-600 dark:text-stone-300 text-sm">
                {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
