import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Clock, Zap, Bell } from 'lucide-react'
import { DROPS } from '@/data/products'
import { useCurrency } from '@/context/CurrencyContext'
import { useToast } from '@/context/ToastContext'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

const GOLD = 'linear-gradient(135deg, #ecc46e 0%, #c8861e 35%, #f4dca8 55%, #a86a14 80%, #ecc46e 100%)'

function useCountdown(target) {
  const [now, setNow] = useState(Date.now())
  useMemo(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (!target) return null
  const diff = new Date(target) - now
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
  const s = Math.floor(diff / 1000)
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[3rem]">
      <span
        className="font-serif text-3xl font-light leading-none tabular-nums"
        style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-body uppercase tracking-[0.25em] text-stone-500 mt-1">{label}</span>
    </div>
  )
}

function DropHero({ drop }) {
  const { format } = useCurrency()
  const { addToast } = useToast()
  const target = drop.status === 'live' ? drop.endsAt : drop.startsAt
  const cd = useCountdown(target)
  const pct = Math.round((drop.claimedUnits / drop.totalUnits) * 100)

  return (
    <div dir="ltr" className="relative overflow-hidden bg-stone-950 dark:bg-black">
      <img
        src={drop.image}
        alt={drop.name}
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/50 dark:from-black dark:via-black/85 dark:to-black/50" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-16 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className={cn(
              'text-[9px] font-body font-semibold uppercase tracking-[0.25em] px-3 py-1.5 flex items-center gap-1.5',
              drop.status === 'live' ? 'bg-white text-stone-900' : 'bg-brand-400 text-white'
            )}>
              {drop.status === 'live' ? (
                <><Zap size={9} /> Live Now</>
              ) : 'Upcoming'}
            </span>
            <span className="text-[10px] font-body uppercase tracking-wider text-stone-500">{drop.brand}</span>
          </div>

          <h2
            className="font-serif font-light leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {drop.name}
          </h2>
          <p className="font-body text-white/40 text-sm leading-relaxed mb-8 max-w-sm">{drop.description}</p>

          {drop.status !== 'ended' && (
            <button
              onClick={() => addToast('You have entered the raffle!')}
              className="px-8 py-3.5 bg-white text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.2em] hover:bg-brand-400 hover:text-white transition-colors"
            >
              Enter Raffle — {format(drop.price)}
            </button>
          )}
        </div>

        {/* Countdown + progress */}
        {drop.status !== 'ended' && cd && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.25em] text-stone-500 mb-4">
                {drop.status === 'live' ? 'Ends in' : 'Starts in'}
              </p>
              <div className="flex items-start gap-4">
                <CountdownUnit value={cd.d} label="Days" />
                <span className="text-brand-400 text-xl font-light mt-2">:</span>
                <CountdownUnit value={cd.h} label="Hours" />
                <span className="text-brand-400 text-xl font-light mt-2">:</span>
                <CountdownUnit value={cd.m} label="Min" />
                <span className="text-brand-400 text-xl font-light mt-2">:</span>
                <CountdownUnit value={cd.s} label="Sec" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-body uppercase tracking-wider text-stone-500 mb-2">
                <span>{pct}% claimed</span>
                <span>{drop.claimedUnits} / {drop.totalUnits} units</span>
              </div>
              <div className="h-px bg-stone-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DropCard({ drop, index }) {
  const { format } = useCurrency()
  const { addToast } = useToast()
  const target = drop.status === 'live' ? drop.endsAt : drop.startsAt
  const cd = useCountdown(target)
  const pct = Math.round((drop.claimedUnits / drop.totalUnits) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden bg-stone-950 dark:bg-stone-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={drop.image}
          alt={drop.name}
          loading="lazy"
          className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500 group-hover:scale-105 transition-transform"
          onError={e => { e.target.src = 'https://placehold.co/800x600/1c1917/c8861e?text=FASHION' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent dark:from-black" />

        {/* Status badge */}
        <div className="absolute top-4 start-4">
          <span className={cn(
            'text-[9px] font-body font-semibold uppercase tracking-[0.2em] px-2.5 py-1 flex items-center gap-1',
            drop.status === 'live'     ? 'bg-white text-stone-900' :
            drop.status === 'upcoming' ? 'bg-brand-400 text-white' :
                                         'bg-stone-700 text-stone-400'
          )}>
            {drop.status === 'live' && <Zap size={9} />}
            {drop.status === 'live' ? 'Live' : drop.status === 'upcoming' ? 'Upcoming' : 'Ended'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-[10px] font-body uppercase tracking-[0.2em] text-stone-500 mb-1">{drop.brand}</p>
        <h3 className="font-serif text-xl text-white leading-snug mb-2">{drop.name}</h3>
        <p className="text-xs font-body text-stone-400 leading-relaxed mb-5">{drop.description}</p>

        {drop.status !== 'ended' && cd && (
          <div className="flex items-center gap-2 mb-4">
            <Clock size={11} className="text-brand-400 flex-shrink-0" />
            <span className="text-[10px] font-body text-stone-400 uppercase tracking-wider">
              {drop.status === 'live' ? 'Ends in:' : 'Starts in:'}
              {' '}{cd.d}d {String(cd.h).padStart(2,'0')}h {String(cd.m).padStart(2,'0')}m {String(cd.s).padStart(2,'0')}s
            </span>
          </div>
        )}

        {drop.status !== 'ended' && (
          <>
            <div className="flex justify-between text-[10px] font-body text-stone-500 mb-1.5 uppercase tracking-wider">
              <span>{pct}% claimed</span>
              <span>{format(drop.price)}</span>
            </div>
            <div className="h-px bg-stone-800 mb-5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-brand-400"
              />
            </div>
            <button
              onClick={() => addToast('You have entered the raffle!')}
              className="w-full py-2.5 bg-white text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-400 hover:text-white transition-colors"
            >
              Enter Raffle
            </button>
          </>
        )}

        {drop.status === 'ended' && (
          <p className="text-[10px] font-body uppercase tracking-wider text-stone-600">Sold out</p>
        )}
      </div>
    </motion.div>
  )
}

export default function Drops() {
  const { t } = useTranslation()
  useSEO({
    title: 'Exclusive Drops',
    description: 'Limited edition luxury drops. Enter the raffle for your chance at ultra-rare pieces.',
  })

  const featured = DROPS.find(d => d.status === 'live') || DROPS.find(d => d.status === 'upcoming')
  const rest = DROPS.filter(d => d !== featured)

  return (
    <div>
      {/* Hero drop */}
      {featured && <DropHero drop={featured} />}

      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />

      {/* All drops grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <p className="text-[10px] font-body uppercase tracking-[0.3em] text-stone-400 mb-2">Limited Releases</p>
            <h2 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-100">All Drops</h2>
          </div>
          <div className="flex items-center gap-2">
            <Bell size={13} className="text-brand-400" />
            <span className="text-[10px] font-body text-stone-400 uppercase tracking-wider">
              {DROPS.filter(d => d.status === 'live').length} Live · {DROPS.filter(d => d.status === 'upcoming').length} Upcoming
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DROPS.map((drop, i) => (
            <DropCard key={drop.id} drop={drop} index={i} />
          ))}
        </div>

        {/* Notify section */}
        <div className="mt-20 border border-stone-200 dark:border-stone-800 p-10 text-center">
          <p className="text-[10px] font-body uppercase tracking-[0.3em] text-stone-400 mb-3">Never miss a drop</p>
          <h3 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-100 mb-6">
            Get early access to exclusive releases
          </h3>
          <div className="flex max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-transparent border border-stone-200 dark:border-stone-700 border-e-0 px-4 py-3 text-sm font-body text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-brand-400 transition-colors"
            />
            <button className="px-6 py-3 bg-stone-950 dark:bg-white text-white dark:text-stone-900 text-[10px] font-body font-semibold uppercase tracking-[0.15em] hover:bg-brand-500 dark:hover:bg-brand-400 dark:hover:text-white transition-colors flex-shrink-0 border border-stone-950 dark:border-white">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
