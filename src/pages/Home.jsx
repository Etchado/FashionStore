import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Clock, Zap, Star, Shield, Gem } from 'lucide-react'
import { useProducts } from '@/context/ProductsContext'
import { useCurrency } from '@/context/CurrencyContext'
import { BrandsMarquee } from '@/components/common/BrandsMarquee'
import { useSEO } from '@/hooks/useSEO'
import { DROPS } from '@/data/products'
import { cn } from '@/lib/cn'

const SLIDES = [
  { src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1400&q=90', label: 'Signature Fragrances' },
  { src: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1400&q=90', label: 'Iconic Timepieces' },
  { src: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1400&q=90', label: 'Luxury Eyewear' },
  { src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=90', label: 'Fine Jewellery' },
  { src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&q=90', label: 'Designer Bags' },
]

import { GOLD } from '@/lib/constants'

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
    <div className="relative overflow-hidden bg-stone-900 group">
      <img
        src={drop.image} alt={drop.name} loading="lazy"
        className="w-full h-64 object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500"
        onError={e => { e.target.src = 'https://placehold.co/800x256/292524/a8a29e?text=FASHION' }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            'text-[9px] font-body font-semibold uppercase tracking-[0.2em] px-2.5 py-1',
            drop.status === 'live' ? 'bg-stone-900 text-white' : drop.status === 'upcoming' ? 'bg-brand-400 text-white' : 'bg-stone-700 text-stone-300'
          )}>
            {drop.status === 'live'
              ? <span className="flex items-center gap-1"><Zap size={9} /> {t('drops.live')}</span>
              : drop.status === 'upcoming' ? t('drops.upcoming') : t('drops.ended')}
          </span>
          <span className="text-[10px] font-body text-stone-400 uppercase tracking-wider">{drop.brand}</span>
        </div>
        <h3 className="font-serif text-xl text-white leading-snug mb-1">{drop.name}</h3>
        <p className="text-xs font-body text-stone-400 mb-4 leading-relaxed">{drop.description}</p>
        {drop.status !== 'ended' && target && (
          <div className="flex items-center gap-2 mb-4">
            <Clock size={11} className="text-brand-400" />
            <span className="text-[10px] font-body text-stone-300 uppercase tracking-wider">
              {drop.status === 'live' ? t('drops.endsIn') : t('drops.startsIn')}:
              {' '}{cd.d}d {String(cd.h).padStart(2,'0')}h {String(cd.m).padStart(2,'0')}m {String(cd.s).padStart(2,'0')}s
            </span>
          </div>
        )}
        {drop.status !== 'ended' && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-body text-stone-400 mb-1.5 uppercase tracking-wider">
              <span>{t('drops.claimed', { pct })}</span>
              <span>{format(drop.price)}</span>
            </div>
            <div className="h-px bg-stone-700">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-brand-400"
              />
            </div>
          </div>
        )}
        {drop.status !== 'ended' && (
          <button className="self-start bg-white text-stone-900 px-5 py-2.5 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-400 hover:text-white transition-colors">
            {t('drops.enterRaffle')}
          </button>
        )}
      </div>
    </div>
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Home() {
  const { t } = useTranslation()
  const { products, loading } = useProducts()
  const { format } = useCurrency()
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])

  useSEO({
    title: 'Luxury Perfumes, Watches & Accessories',
    description: 'Discover authentic luxury fragrances, iconic watches, and premium accessories at Fashion Store.',
  })

  const featured = useMemo(() => products.filter(p => p.badges?.includes('BESTSELLER')).slice(0, 4), [products])

  const categories = [
    {
      key: 'perfumes',
      label: t('nav.perfumes'),
      sub: 'Rare fragrances',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=85',
      href: '/shop?category=perfumes',
    },
    {
      key: 'watches',
      label: t('nav.watches'),
      sub: 'Iconic timepieces',
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=85',
      href: '/shop?category=watches',
    },
    {
      key: 'accessories',
      label: t('nav.accessories'),
      sub: 'Artisan crafted',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85',
      href: '/shop?category=accessories',
    },
  ]

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section dir="ltr" className="relative bg-stone-950 dark:bg-black overflow-hidden flex flex-col md:block md:h-screen md:min-h-[640px]">

        {/* ── RIGHT: cycling images — top on mobile, right half on desktop ── */}
        <div className="relative h-64 flex-shrink-0 overflow-hidden md:absolute md:h-auto md:top-0 md:bottom-0 md:right-0 md:left-[44%]">
          <AnimatePresence mode="sync">
            <motion.img
              key={slide}
              src={SLIDES[slide].src}
              alt={SLIDES[slide].label}
              className="absolute inset-0 w-full h-full object-cover object-center"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              onError={e => { e.target.src = 'https://placehold.co/1400x900/1c1917/c8861e?text=FASHION' }}
            />
          </AnimatePresence>
          {/* Mobile: bottom fade into dark panel */}
          <div className="md:hidden absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />
          {/* Desktop: left-edge gradient blending into diagonal cut */}
          <div className="hidden md:block absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-stone-950 dark:from-black to-transparent pointer-events-none z-10" />
        </div>

        {/* ── LEFT: solid dark panel — below on mobile, left on desktop ── */}
        <div
          className="relative flex-1 flex items-center justify-center bg-stone-950 dark:bg-black z-10 md:absolute md:top-0 md:bottom-0 md:left-0 md:w-[52%] md:[clip-path:polygon(0_0,100%_0,88%_100%,0_100%)]"
        >
          {/* Halftone gold dots — fills entire dark panel, clipped by parent clip-path */}
          <div
            className="hidden md:block absolute inset-0 opacity-[0.20] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #c8861e 1.5px, transparent 1.5px)',
              backgroundSize: '13px 13px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 w-full px-8 py-12 md:py-0 max-w-sm md:max-w-md lg:max-w-lg">

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-7 h-px bg-brand-400" />
              <span className="text-[9px] font-body uppercase tracking-[0.35em] text-brand-400/70">
                Autumn / Winter 2025
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif font-light leading-[1.05] mb-4"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 6.5rem)',
                background: GOLD,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The Art of<br />
              <em className="italic">Timeless</em><br />
              Elegance
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center gap-2 mb-6 origin-left"
            >
              <div className="h-px w-10 bg-brand-400" />
              <span className="text-brand-400 text-[10px]">✦</span>
              <div className="h-px w-10 bg-brand-400" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="font-body text-white/40 text-sm leading-relaxed mb-10 max-w-[280px]"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              <Link
                to="/shop"
                className="inline-block border border-brand-400/50 text-brand-300 px-8 py-3 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-400/10 hover:border-brand-400 transition-all duration-300"
              >
                Explore Collection
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex items-center gap-2 mt-10 mb-8"
            >
              <div className="h-px flex-1 bg-brand-400" />
              <span className="text-brand-400 text-[10px]">✦</span>
              <div className="h-px flex-1 bg-brand-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="flex gap-8"
            >
              {[
                { num: '500+', label: 'Exclusive Pieces' },
                { num: '50+',  label: 'Luxury Brands' },
                { num: '2024', label: 'Est.' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-serif text-xl" style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {stat.num}
                  </p>
                  <p className="text-[9px] font-body uppercase tracking-wider text-white/30 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>


        {/* ── Slide indicators — desktop bottom-right ── */}
        <div className="hidden md:flex absolute bottom-8 right-8 z-30 flex-col items-end gap-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={slide}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-[9px] font-body uppercase tracking-[0.25em] text-white/35"
            >
              {SLIDES[slide].label}
            </motion.span>
          </AnimatePresence>
          <div className="flex gap-1.5 items-center">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={cn('h-px bg-brand-400 transition-all duration-500', i === slide ? 'w-8 opacity-100' : 'w-2.5 opacity-25')}
              />
            ))}
          </div>
        </div>

        {/* ── Mobile slide dots ── */}
        <div className="md:hidden flex justify-center gap-1.5 py-4 bg-stone-950 dark:bg-black">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={cn('h-px bg-brand-400 transition-all duration-500', i === slide ? 'w-6 opacity-100' : 'w-2 opacity-25')}
            />
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-brand-50 dark:bg-stone-900 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-[10px] font-body uppercase tracking-[0.35em] text-brand-500 mb-3">Curated Selection</p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 dark:text-white">Featured Pieces</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-stone-200 dark:bg-stone-800 aspect-[3/4] mb-4" />
                    <div className="bg-stone-200 dark:bg-stone-800 h-4 w-3/4 mb-2" />
                    <div className="bg-stone-200 dark:bg-stone-800 h-3 w-1/3" />
                  </div>
                ))
              : featured.map((p, i) => (
                <motion.div key={p.id} {...fadeUp(i * 0.08)}>
                  <Link to={`/product/${p.id}`} className="group block">
                    <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-stone-100 dark:bg-stone-800">
                      {p.badges?.includes('NEW') && (
                        <span className="absolute top-3 start-3 z-10 bg-brand-400 text-white text-[9px] font-body uppercase tracking-[0.15em] px-2.5 py-1">
                          New
                        </span>
                      )}
                      {p.badges?.includes('EXCLUSIVE') && (
                        <span className="absolute top-3 start-3 z-10 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[9px] font-body uppercase tracking-[0.15em] px-2.5 py-1">
                          Exclusive
                        </span>
                      )}
                      <img
                        src={p.image} alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={e => { e.target.src = 'https://placehold.co/400x533/e7e5e4/78716c?text=FASHION' }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    <p className="font-serif text-stone-900 dark:text-white text-lg leading-snug">{p.name}</p>
                    <p className="font-body text-stone-400 text-sm mt-1">{format(p.price)}</p>
                  </Link>
                </motion.div>
              ))
            }
          </div>

          <motion.div {...fadeUp(0.2)} className="text-center mt-14">
            <Link
              to="/shop"
              className="inline-block border border-stone-900 dark:border-white text-stone-900 dark:text-white px-10 py-3.5 text-[11px] font-body font-semibold uppercase tracking-[0.18em] hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 transition-colors duration-300"
            >
              View All Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HERITAGE / STORY ── */}
      <section className="bg-white dark:bg-stone-950 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: image + floating stat */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85"
                alt="Our Heritage"
                className="w-full aspect-[4/5] object-cover"
                onError={e => { e.target.src = 'https://placehold.co/800x1000/e7e5e4/78716c?text=FASHION' }}
              />
              {/* Floating stat card */}
              <div className="absolute -bottom-6 end-0 lg:-end-6 bg-white dark:bg-stone-900 shadow-2xl px-8 py-6 min-w-[160px]">
                <p className="font-serif text-4xl text-stone-900 dark:text-white">5+</p>
                <p className="text-[9px] font-body uppercase tracking-[0.2em] text-stone-400 mt-1.5">Years of Excellence</p>
              </div>
            </motion.div>

            {/* Right: content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="lg:pl-8 pt-8 lg:pt-0"
            >
              <p className="text-[10px] font-body uppercase tracking-[0.35em] text-brand-500 mb-5">Our Heritage</p>
              <h2 className="font-serif font-light text-4xl md:text-5xl text-stone-900 dark:text-white leading-tight mb-7">
                A Legacy of<br />
                <em className="italic text-brand-500">Craftsmanship</em>
              </h2>
              <p className="font-body text-stone-500 dark:text-stone-400 leading-relaxed mb-4 text-[15px]">
                Fashion Store brings together the world's most coveted luxury fragrances, timepieces, and accessories — each piece selected for its uncompromising quality and enduring design.
              </p>
              <p className="font-body text-stone-500 dark:text-stone-400 leading-relaxed mb-12 text-[15px]">
                Every product in our collection tells a story of rare materials, artisan dedication, and a standard of excellence that never settles.
              </p>

              {/* Icon trio */}
              <div className="grid grid-cols-3 gap-6 mb-12 pb-12 border-b border-stone-100 dark:border-stone-800">
                {[
                  { Icon: Star,   label: 'Quality',  sub: 'Uncompromising standards' },
                  { Icon: Gem,    label: 'Passion',   sub: 'Artisan dedication' },
                  { Icon: Shield, label: 'Timeless',  sub: 'Enduring design' },
                ].map(({ Icon, label, sub }) => (
                  <div key={label}>
                    <Icon size={18} className="text-brand-500 mb-3" strokeWidth={1.5} />
                    <p className="font-body font-semibold text-stone-900 dark:text-white text-sm mb-0.5">{label}</p>
                    <p className="font-body text-stone-400 text-[11px] leading-snug">{sub}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/shop"
                className="inline-block border border-stone-900 dark:border-white text-stone-900 dark:text-white px-8 py-3.5 text-[11px] font-body font-semibold uppercase tracking-[0.18em] hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 transition-colors duration-300"
              >
                Discover Our Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ── */}
      <section className="bg-brand-50 dark:bg-stone-900 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-[10px] font-body uppercase tracking-[0.35em] text-brand-500 mb-3">Explore</p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 dark:text-white">Our Collections</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.key} {...fadeUp(i * 0.1)}>
                <Link to={cat.href} className="group block relative overflow-hidden aspect-[4/5] bg-stone-200 dark:bg-stone-800">
                  <img
                    src={cat.image} alt={cat.label} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={e => { e.target.src = `https://placehold.co/600x750/292524/a8a29e?text=${cat.label}` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 start-0 end-0 p-6">
                    <h3 className="font-serif text-2xl text-white">{cat.label}</h3>
                    <p className="text-[10px] font-body uppercase tracking-wider text-white/50 mt-1">{cat.sub}</p>
                  </div>
                  <div className="absolute top-5 end-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight size={18} className="text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS MARQUEE ── */}
      <BrandsMarquee />

      {/* ── INNER CIRCLE / VIP ── */}
      <section className="bg-stone-950 dark:bg-black py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-8 h-px bg-brand-400" />
                <p className="text-[10px] font-body uppercase tracking-[0.35em] text-brand-400">Exclusive Access</p>
              </div>
              <h2 className="font-serif font-light text-4xl md:text-5xl text-white leading-tight mb-6">
                Join the<br />
                <em className="italic text-brand-400">Inner Circle</em>
              </h2>
              <p className="font-body text-stone-400 text-[15px] leading-relaxed mb-10 max-w-sm">
                Create an account and unlock exclusive benefits: early access to new collections, priority drops, personal styling, and member-only pricing.
              </p>

              <ul className="space-y-4 mb-12">
                {[
                  'Priority access to limited editions',
                  'Invitations to private events',
                  'Complimentary gift wrapping',
                  'Personal style advisor',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 font-body text-sm text-stone-300">
                    <div className="w-4 h-4 rounded-full border border-brand-400 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/account"
                className="inline-block bg-brand-400 text-white px-8 py-3.5 text-[11px] font-body font-semibold uppercase tracking-[0.18em] hover:bg-brand-500 transition-colors duration-300"
              >
                Request Membership
              </Link>
            </motion.div>

            {/* Right: image + VIP badge */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85"
                alt="VIP Membership"
                className="w-full aspect-[4/5] object-cover"
                onError={e => { e.target.src = 'https://placehold.co/800x1000/292524/a8a29e?text=VIP' }}
              />
              {/* Floating VIP badge */}
              <div className="absolute top-8 start-0 lg:-start-8 bg-white/8 backdrop-blur-md border border-white/15 px-6 py-5">
                <p className="font-body font-bold text-white text-lg tracking-wider">VIP</p>
                <p className="text-[9px] font-body uppercase tracking-[0.2em] text-white/50 mt-0.5">Member Benefits</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXCLUSIVE DROPS ── */}
      <section className="bg-white dark:bg-stone-950 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div {...fadeUp()} className="flex items-end justify-between mb-16">
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.35em] text-brand-500 mb-3">Limited Release</p>
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 dark:text-white">{t('home.drops')}</h2>
            </div>
            <p className="hidden md:block font-body text-sm text-stone-400">{t('drops.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DROPS.map((drop, i) => (
              <motion.div key={drop.id} {...fadeUp(i * 0.1)}>
                <DropCard drop={drop} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="bg-brand-50 dark:bg-stone-900 py-24">
        <div className="max-w-lg mx-auto px-8 text-center">
          <motion.div {...fadeUp()}>
            <p className="text-[10px] font-body uppercase tracking-[0.35em] text-brand-500 mb-3">Stay Connected</p>
            <h2 className="font-serif text-4xl text-stone-900 dark:text-white mb-4">Stay in Touch</h2>
            <p className="font-body text-stone-400 text-sm leading-relaxed mb-10">
              Subscribe to receive updates on new arrivals, exclusive offers, and styling inspiration.
            </p>
            <form
              onSubmit={e => e.preventDefault()}
              className="flex"
            >
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 px-4 py-3.5 text-sm font-body text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-brand-400 transition-colors"
              />
              <button
                type="submit"
                className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-3.5 text-[10px] font-body font-semibold uppercase tracking-[0.18em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors duration-300 whitespace-nowrap"
              >
                {t('footer.newsletter.subscribe')}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
