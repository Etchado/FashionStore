import { cn } from '@/lib/cn'

const styles = {
  NEW:        'bg-brand-400 text-white',
  SALE:       'bg-stone-900 dark:bg-white text-white dark:text-stone-900',
  BESTSELLER: 'bg-brand-500 text-white',
  EXCLUSIVE:  'bg-stone-900 dark:bg-white text-white dark:text-stone-900',
}

export function Badge({ type, className }) {
  return (
    <span className={cn('px-2 py-0.5 text-[10px] font-body font-semibold uppercase tracking-wider rounded-full', styles[type] || 'bg-stone-200 text-stone-700', className)}>
      {type}
    </span>
  )
}
