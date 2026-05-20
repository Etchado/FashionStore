import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Package, TrendingUp } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/context/CurrencyContext'
import { useToast } from '@/context/ToastContext'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

import { GOLD } from '@/lib/constants'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLE = {
  pending:    'border-stone-300 dark:border-stone-600 text-stone-500',
  paid:       'border-stone-400 text-stone-600 dark:border-stone-500 dark:text-stone-400',
  processing: 'border-brand-400/60 text-brand-500',
  shipped:    'border-brand-500 text-brand-400',
  delivered:  'border-stone-900 dark:border-white text-stone-900 dark:text-white font-semibold',
  cancelled:  'border-stone-200 dark:border-stone-700 text-stone-400 line-through',
}

const PAGE_SIZE = 10

export default function Admin() {
  const { t } = useTranslation()
  const { user, loading, isAdmin } = useAuth()
  const { format } = useCurrency()
  const { addToast } = useToast()

  useSEO({ title: t('admin.title') })

  const [orders, setOrders] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [allTimeRevenue, setAllTimeRevenue] = useState(0)
  const [allTimeDelivered, setAllTimeDelivered] = useState(0)

  useEffect(() => {
    if (!isAdmin) return
    const fetchOrders = async () => {
      const { data, count } = await supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
      if (data) setOrders(data)
      if (count != null) setTotal(count)
    }
    fetchOrders()
  }, [isAdmin, page])

  useEffect(() => {
    if (!isAdmin) return
    const fetchStats = async () => {
      const { data } = await supabase
        .from('orders')
        .select('total, status')
      if (data) {
        setAllTimeRevenue(data.reduce((s, o) => s + (o.total || 0), 0))
        setAllTimeDelivered(data.filter(o => o.status === 'delivered').length)
      }
    }
    fetchStats()
  }, [isAdmin])

  const updateStatus = async (orderId, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      if (status === 'delivered') setAllTimeDelivered(n => n + 1)
      addToast(`Order updated to ${status}`)
    } else {
      addToast(t('toast.error'), 'error')
    }
  }

  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/" replace />

  return (
    <div>
      {/* Header */}
      <div dir="ltr" className="relative bg-stone-950 dark:bg-black border-b border-stone-900">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
          <p className="text-[10px] font-body uppercase tracking-[0.3em] text-brand-400/60 mb-2">Dashboard</p>
          <h1 className="font-serif text-3xl font-light text-white">{t('admin.title')}</h1>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: total.toString() },
            { label: 'Delivered', value: allTimeDelivered.toString() },
            { label: 'Total Revenue', value: format(allTimeRevenue) },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="border border-stone-200 dark:border-stone-800 p-5">
              <p className="text-[10px] font-body uppercase tracking-[0.2em] text-stone-400 mb-2">{label}</p>
              <p
                className="font-serif text-2xl font-light"
                style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-stone-400">
            Orders
          </p>
          <p className="text-[10px] font-body text-stone-400">
            Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
          </p>
        </div>

        <div className="space-y-2">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4 border border-stone-200 dark:border-stone-800">
              <Package size={32} className="text-stone-300 dark:text-stone-600" />
              <p className="font-body text-stone-400 text-sm">{t('admin.noOrders')}</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className="border border-stone-200 dark:border-stone-800 overflow-hidden">
              {/* Header row */}
              <div className="flex items-center flex-wrap gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-stone-900 dark:text-stone-100 text-sm">
                    #{order.order_number}
                  </p>
                  <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider mt-0.5">
                    {order.shipping_info?.email || 'Guest'} · {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <span className={cn(
                  'text-[10px] font-body font-medium uppercase tracking-wider px-2.5 py-1 border',
                  STATUS_STYLE[order.status] || STATUS_STYLE.pending
                )}>
                  {t(`account.orderStatus.${order.status}`)}
                </span>

                <select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value)}
                  className="text-[10px] font-body bg-transparent border border-stone-200 dark:border-stone-700 px-3 py-1.5 outline-none focus:border-brand-400 transition-colors text-stone-600 dark:text-stone-300 uppercase tracking-wider"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{t(`account.orderStatus.${s}`)}</option>)}
                </select>

                <span
                  className="font-serif text-lg font-light flex-shrink-0"
                  style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {format(order.total)}
                </span>

                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Expanded items */}
              {expanded === order.id && (
                <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-5 bg-stone-50 dark:bg-stone-900">
                  <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-4">
                    {t('admin.orderItems')}
                  </p>
                  <div className="space-y-2 mb-5">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm font-body">
                        <span className="text-stone-500 dark:text-stone-400">
                          {item.name}{item.variant_label ? ` (${item.variant_label})` : ''} × {item.qty}
                        </span>
                        <span className="text-stone-700 dark:text-stone-300">{format(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  {order.shipping_info && (
                    <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                      <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-stone-400 mb-2">Shipping To</p>
                      <p className="text-sm font-body text-stone-500 dark:text-stone-400">
                        {order.shipping_info.firstName} {order.shipping_info.lastName} ·{' '}
                        {order.shipping_info.address}, {order.shipping_info.city}, {order.shipping_info.country}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-5 py-2.5 text-[10px] font-body font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← {t('common.prev')}
            </button>
            <span className="text-[10px] font-body text-stone-400 uppercase tracking-wider">
              {page + 1} / {Math.ceil(total / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= total}
              className="px-5 py-2.5 text-[10px] font-body font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('common.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
