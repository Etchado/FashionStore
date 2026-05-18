import { cn } from '@/lib/cn'

const styles = {
  NEW:        'bg-emerald-500 text-white',
  SALE:       'bg-red-500 text-white',
  BESTSELLER: 'bg-brand-500 text-white',
  EXCLUSIVE:  'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900',
}

export function Badge({ type, className }) {
  return (
    <span className={cn('px-2 py-0.5 text-[10px] font-body font-semibold uppercase tracking-wider rounded-full', styles[type] || 'bg-stone-200 text-stone-700', className)}>
      {type}
    </span>
  )
}
