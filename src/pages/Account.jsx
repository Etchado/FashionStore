import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, Star, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/context/CurrencyContext'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  shipped: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const TIER_COLOR = {
  Bronze: 'text-amber-600',
  Silver: 'text-stone-400',
  Gold: 'text-yellow-500',
  Platinum: 'text-sky-400',
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
  const tier = points >= 10000 ? 'Platinum' : points >= 5000 ? 'Gold' : points >= 1000 ? 'Silver' : 'Bronze'

  const tabs = [
    { key: 'orders', label: t('account.orders'), icon: Package },
    { key: 'loyalty', label: t('account.loyalty'), icon: Star },
    { key: 'profile', label: t('account.profile'), icon: UserIcon },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 mb-2">{t('account.title')}</h1>
      <p className="font-body text-stone-400 mb-8">{t('account.welcome', { name: user.email })}</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-stone-200 dark:border-stone-700">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn('flex items-center gap-2 px-4 py-3 text-sm font-body font-medium border-b-2 -mb-px transition-colors',
              tab === key ? 'border-brand-500 text-brand-500' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0
            ? <p className="font-body text-stone-400 text-sm text-center py-12">{t('account.noOrders')}</p>
            : orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <p className="font-body font-semibold text-stone-900 dark:text-stone-100">{t('account.orderNumber', { number: order.order_number })}</p>
                    <p className="text-xs font-body text-stone-400">{t('account.orderDate', { date: new Date(order.created_at).toLocaleDateString() })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('text-xs font-body font-semibold px-3 py-1 rounded-full', STATUS_COLORS[order.status] || STATUS_COLORS.pending)}>
                      {t(`account.orderStatus.${order.status}`)}
                    </span>
                    <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{format(order.total)}</span>
                  </div>
                </div>
                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm font-body text-stone-600 dark:text-stone-300">
                        <span>{item.name} {item.variant_label ? `(${item.variant_label})` : ''} × {item.qty}</span>
                        <span>{format(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* Loyalty */}
      {tab === 'loyalty' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-8 text-center">
          <div className={cn('font-serif text-5xl font-semibold mb-2', TIER_COLOR[tier])}>{tier}</div>
          <p className="font-body text-stone-500 mb-6">{t('account.loyalty.points', { points })}</p>
          <div className="flex justify-center gap-4 mb-8">
            {['Bronze', 'Silver', 'Gold', 'Platinum'].map((t2, i) => (
              <div key={t2} className={cn('text-xs font-body', t2 === tier ? TIER_COLOR[t2] + ' font-semibold' : 'text-stone-300 dark:text-stone-600')}>
                {t2}
              </div>
            ))}
          </div>
          <p className="text-sm font-body text-stone-400">{t('account.loyalty.earnMore')}</p>
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-body font-semibold uppercase tracking-wider text-stone-400">{t('auth.email')}</label>
            <p className="mt-1 font-body text-stone-800 dark:text-stone-100">{user.email}</p>
          </div>
          <div>
            <label className="text-xs font-body font-semibold uppercase tracking-wider text-stone-400">Account ID</label>
            <p className="mt-1 font-body text-stone-500 text-sm">{user.id}</p>
          </div>
        </div>
      )}
    </div>
  )
}
