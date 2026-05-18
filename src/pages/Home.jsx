import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Clock, Zap } from 'lucide-react'
import { useProducts } from '@/context/ProductsContext'
import { useCurrency } from '@/context/CurrencyContext'
import { ProductGrid } from '@/components/product/ProductGrid'
import { BrandsMarquee } from '@/components/common/BrandsMarquee'
import { Button } from '@/components/ui/Button'
import { useSEO } from '@/hooks/useSEO'
import { DROPS } from '@/data/products'
import { cn } from '@/lib/cn'

function useCountdown(target) {
  const [now, setNow] = useState(Date.now())
  useMemo(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = new Date(target) - now
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
  const s = Math.floor(diff / 1000)
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

function DropCard({ drop }) {
  const { t } = useTranslation()
  const { format } = useCurrency()
  const target = drop.status === 'live' ? drop.endsAt : drop.startsAt
  const cd = useCountdown(target)
  const pct = Math.round((drop.claimedUnits / drop.totalUnits) * 100)

  return (
    <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white group">
      <img src={drop.image} alt={drop.name} loading="lazy" className="w-full h-56 object-cover opacity-60 group-hover:opacity-70 transition-opacity" onError={e => { e.target.src = 'https://placehold.co/800x224/292524/a8a29e?text=FASHION' }} />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-xs font-body font-semibold px-2 py-0.5 rounded-full', drop.status === 'live' ? 'bg-red-500' : drop.status === 'upcoming' ? 'bg-brand-500' : 'bg-stone-600')}>
            {drop.status === 'live' ? <span className="flex items-center gap-1"><Zap size={10} /> {t('drops.live')}</span> : drop.status === 'upcoming' ? t('drops.upcoming') : t('drops.ended')}
          </span>
          <span className="text-xs font-body text-stone-300">{drop.brand}</span>
        </div>
        <h3 className="font-serif text-lg leading-snug mb-1">{drop.name}</h3>
        <p className="text-xs font-body text-stone-300 mb-3">{drop.description}</p>
        {drop.status !== 'ended' && target && (
          <div className="flex items-center gap-2 mb-3">
            <Clock size={12} className="text-stone-400" />
            <span className="text-xs font-body text-stone-300">
              {drop.status === 'live' ? t('drops.endsIn') : t('drops.startsIn')}:
              {' '}{cd.d}d {String(cd.h).padStart(2,'0')}h {String(cd.m).padStart(2,'0')}m {String(cd.s).padStart(2,'0')}s
            </span>
          </div>
        )}
        {drop.status !== 'ended' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs font-body text-stone-400 mb-1">
              <span>{t('drops.claimed', { pct })}</span>
              <span>{format(drop.price)}</span>
            </div>
            <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                className="h-full bg-brand-500 rounded-full"
              />
            </div>
          </div>
        )}
        {drop.status !== 'ended' && (
          <Button size="sm" className="self-start">{t('drops.enterRaffle')}</Button>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useTranslation()
  const { products, loading } = useProducts()

  useSEO({
    title: 'Luxury Perfumes, Watches & Accessories',
    description: 'Discover authentic luxury fragrances, iconic watches, and premium accessories at Fashion Store.',
  })

  const featured = useMemo(() => products.filter(p => p.badges?.includes('BESTSELLER')).slice(0, 6), [products])
  const newArrivals = useMemo(() => products.filter(p => p.badges?.includes('NEW')).slice(0, 3), [products])

  const categories = [
    { key: 'perfumes', label: t('nav.perfumes'), image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80', href: '/shop?category=perfumes' },
    { key: 'watches', label: t('nav.watches'), image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80', href: '/shop?category=watches' },
    { key: 'accessories', label: t('nav.accessories'), image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', href: '/shop?category=accessories' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen min-h-[640px] overflow-hidden flex items-center justify-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1920&q=90"
            alt="Luxury flat lay"
            className="w-full h-full object-cover scale-105"
            style={{ transformOrigin: 'center 40%' }}
            onError={e => { e.target.src = 'https://placehold.co/1920x1080/1c1917/a8a29e?text=FASHION+STORE' }}
          />
          {/* Multi-layer overlay for cinematic depth */}
          <div className="absolute inset-0 bg-stone-950/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/20" />
        </div>

        {/* Centered content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-body text-[10px] uppercase tracking-[0.35em] text-brand-300 mb-6"
          >
            {t('site.tagline')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white leading-[1.05] tracking-tight mb-6"
          >
            {t('home.hero.title')}
          </motion.h1>

          {/* Thin gold rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="w-20 h-px bg-brand-400 mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="font-body text-stone-300/90 text-base md:text-lg leading-relaxed max-w-md mx-auto mb-10"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="flex items-center justify-center gap-6 flex-wrap"
          >
            <Link to="/shop">
              <Button size="lg">{t('home.hero.cta')}</Button>
            </Link>
            <Link
              to="/shop?sort=newest"
              className="flex items-center gap-2 font-body text-stone-200 hover:text-brand-300 transition-colors text-sm tracking-wide"
            >
              {t('home.hero.ctaSecondary')} <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="font-body text-[9px] uppercase tracking-[0.25em] text-stone-400">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-stone-400 to-transparent"
          />
        </motion.div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-serif text-3xl text-stone-900 dark:text-stone-100 mb-10 text-center"
        >
          {t('home.categories')}
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <Link to={cat.href} className="group block relative aspect-[3/4] overflow-hidden rounded-2xl">
                <img
                  src={cat.image} alt={cat.label} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => { e.target.src = 'https://placehold.co/400x533/292524/a8a29e?text=' + cat.label }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent" />
                <div className="absolute bottom-6 start-6 end-6 flex items-end justify-between">
                  <h3 className="font-serif text-2xl text-white">{cat.label}</h3>
                  <ArrowRight size={20} className="text-white group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brands Marquee */}
      <BrandsMarquee />

      {/* Featured / Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl text-stone-900 dark:text-stone-100"
          >
            {t('home.bestsellers')}
          </motion.h2>
          <Link to="/shop" className="flex items-center gap-1 text-sm font-body text-brand-500 hover:text-brand-600 transition-colors">
            {t('common.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>

      {/* Builder Promo */}
      <section className="bg-stone-950 py-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="flex-1"
          >
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-brand-400 mb-3">Signature Experience</p>
            <h2 className="font-serif text-4xl text-white mb-4">{t('home.builderPromo.title')}</h2>
            <p className="font-body text-stone-400 mb-8 leading-relaxed">{t('home.builderPromo.subtitle')}</p>
            <Link to="/builder"><Button size="lg">{t('home.builderPromo.cta')}</Button></Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="flex-1 grid grid-cols-2 gap-4"
          >
            {[
              'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80',
              'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80',
            ].map((src, i) => (
              <div key={i} className={cn('rounded-2xl overflow-hidden aspect-square', i === 1 && 'mt-8')}>
                <img src={src} alt="" className="w-full h-full object-cover opacity-80" onError={e => { e.target.src = 'https://placehold.co/400x400/292524/a8a29e?text=FASHION' }} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Drops */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl text-stone-900 dark:text-stone-100">{t('home.drops')}</h2>
            <p className="font-body text-sm text-stone-400 mt-1">{t('drops.subtitle')}</p>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DROPS.map((drop, i) => (
            <motion.div key={drop.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <DropCard drop={drop} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals strip */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-10">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-serif text-3xl text-stone-900 dark:text-stone-100">
              {t('home.newArrivals')}
            </motion.h2>
            <Link to="/shop?sort=newest" className="flex items-center gap-1 text-sm font-body text-brand-500 hover:text-brand-600 transition-colors">
              {t('common.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={newArrivals} loading={false} />
        </section>
      )}
    </div>
  )
}
