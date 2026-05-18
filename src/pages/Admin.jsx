import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/context/CurrencyContext'
import { useToast } from '@/context/ToastContext'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  shipped: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
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

  const updateStatus = async (orderId, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      addToast(`Order updated to ${status}`)
    } else {
      addToast(t('toast.error'), 'error')
    }
  }

  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/" replace />

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 mb-2">{t('admin.title')}</h1>
      <p className="font-body text-stone-400 mb-8">{total} total orders</p>

      <div className="space-y-3">
        {orders.length === 0
          ? <p className="font-body text-stone-400 text-center py-16">{t('admin.noOrders')}</p>
          : orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center flex-wrap gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-stone-900 dark:text-stone-100 text-sm">#{order.order_number}</p>
                  <p className="text-xs font-body text-stone-400">{order.shipping_info?.email || 'Guest'} · {new Date(order.created_at).toLocaleDateString()}</p>
                </div>

                <span className={cn('text-xs font-body font-semibold px-3 py-1 rounded-full', STATUS_COLORS[order.status] || STATUS_COLORS.pending)}>
                  {t(`account.orderStatus.${order.status}`)}
                </span>

                <select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value)}
                  className="text-xs font-body bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-400 text-stone-700 dark:text-stone-200"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{t(`account.orderStatus.${s}`)}</option>)}
                </select>

                <span className="font-body font-semibold text-stone-900 dark:text-stone-100">{format(order.total)}</span>

                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="text-stone-400 hover:text-brand-500 transition-colors"
                >
                  {expanded === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {/* Expanded items */}
              {expanded === order.id && order.order_items?.length > 0 && (
                <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-4">
                  <p className="text-xs font-body font-semibold uppercase tracking-wider text-stone-400 mb-3">{t('admin.orderItems')}</p>
                  <div className="space-y-2">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm font-body text-stone-600 dark:text-stone-300">
                        <span>{item.name}{item.variant_label ? ` (${item.variant_label})` : ''} × {item.qty}</span>
                        <span>{format(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  {order.shipping_info && (
                    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                      <p className="text-xs font-body font-semibold uppercase tracking-wider text-stone-400 mb-2">Shipping To</p>
                      <p className="text-sm font-body text-stone-600 dark:text-stone-300">
                        {order.shipping_info.firstName} {order.shipping_info.lastName},
                        {' '}{order.shipping_info.address}, {order.shipping_info.city}, {order.shipping_info.country}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-body border border-stone-200 dark:border-stone-700 rounded-xl disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            {t('common.prev')}
          </button>
          <span className="text-sm font-body text-stone-500">{t('common.page')} {page + 1} {t('common.of')} {Math.ceil(total / PAGE_SIZE)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * PAGE_SIZE >= total}
            className="px-4 py-2 text-sm font-body border border-stone-200 dark:border-stone-700 rounded-xl disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  )
}
