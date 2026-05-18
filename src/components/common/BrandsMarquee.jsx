import { useTranslation } from 'react-i18next'
import { BRANDS } from '@/data/products'

export function BrandsMarquee() {
  const { t } = useTranslation()
  const doubled = [...BRANDS, ...BRANDS]

  return (
    <section className="py-10 border-y border-stone-200 dark:border-stone-800 overflow-hidden">
      <p className="text-center text-xs font-body font-semibold uppercase tracking-widest text-stone-400 mb-6">
        {t('home.brandsTitle')}
      </p>
      <div className="relative">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {doubled.map((brand, i) => (
            <span
              key={i}
              className="font-serif text-xl text-stone-300 dark:text-stone-700 hover:text-brand-400 dark:hover:text-brand-500 transition-colors cursor-default select-none flex-shrink-0"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
