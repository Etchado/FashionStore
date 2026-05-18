import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Check, X, ShoppingBag, RotateCcw, Sparkles, ChevronRight } from 'lucide-react'
import { useProducts } from '@/context/ProductsContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { useCurrency } from '@/context/CurrencyContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/cn'

const STEPS = [
  { key: 'fragrance', category: 'perfumes', icon: '🌸', label: 'builder.steps.fragrance' },
  { key: 'watch', category: 'watches', icon: '⌚', label: 'builder.steps.watch' },
  { key: 'accessory', category: 'accessories', icon: '💎', label: 'builder.steps.accessory' },
]

function BuilderCard({ product, selected, onSelect, format }) {
  const [imgError, setImgError] = useState(false)
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <motion.button
      onClick={() => onSelect(product)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative text-start rounded-2xl border-2 overflow-hidden transition-all duration-200',
        selected ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-stone-200 dark:border-stone-700 hover:border-brand-300 dark:hover:border-brand-600'
      )}
    >
      <div className="aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={imgError ? 'https://placehold.co/300x400/e7e5e4/78716c?text=AURA' : product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {selected && (
          <div className="absolute top-3 end-3 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center shadow-md">
            <Check size={14} className="text-white" />
          </div>
        )}
        {discountPct && (
          <div className="absolute top-3 start-3 bg-red-500 text-white text-[10px] font-body font-bold px-2 py-0.5 rounded-full">-{discountPct}%</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-body text-stone-400 uppercase tracking-wider">{product.brand}</p>
        <p className="font-serif text-sm text-stone-900 dark:text-stone-100 line-clamp-2 mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="font-body text-sm font-semibold text-brand-500">{format(product.price)}</span>
          {product.originalPrice && <span className="font-body text-xs text-stone-400 line-through">{format(product.originalPrice)}</span>}
        </div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {product.badges?.slice(0, 2).map(b => <Badge key={b} type={b} />)}
        </div>
      </div>
    </motion.button>
  )
}

export default function Builder() {
  const { t } = useTranslation()
  const { products } = useProducts()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { format } = useCurrency()

  useSEO({
    title: t('builder.title'),
    description: t('builder.subtitle'),
  })

  const [stepIdx, setStepIdx] = useState(0)
  const [selections, setSelections] = useState({ fragrance: null, watch: null, accessory: null })

  const currentStep = STEPS[stepIdx]
  const stepProducts = useMemo(
    () => products.filter(p => p.category === currentStep.category && p.inStock),
    [products, currentStep.category]
  )

  const runningTotal = useMemo(() =>
    Object.values(selections).reduce((sum, p) => sum + (p?.price || 0), 0),
    [selections]
  )

  const selected = selections[currentStep.key]

  const selectProduct = (product) => {
    setSelections(s => ({ ...s, [currentStep.key]: product }))
  }

  const clear = () => {
    setSelections({ fragrance: null, watch: null, accessory: null })
    setStepIdx(0)
  }

  const addBundleToCart = () => {
    const bundle = Object.values(selections).filter(Boolean)
    if (bundle.length === 0) return
    bundle.forEach(p => addItem(p, p.variants?.[0]))
    addToast(t('builder.bundleSaved'))
    clear()
  }

  const completedCount = Object.values(selections).filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-body font-medium mb-4">
            <Sparkles size={14} /> Signature Experience
          </div>
          <h1 className="font-serif text-5xl text-stone-900 dark:text-stone-100 mb-3">{t('builder.title')}</h1>
          <p className="font-body text-stone-500 max-w-lg mx-auto">{t('builder.subtitle')}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Steps + Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Step list */}
          <div className="space-y-2">
            {STEPS.map((step, i) => {
              const sel = selections[step.key]
              return (
                <button
                  key={step.key}
                  onClick={() => setStepIdx(i)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-start',
                    stepIdx === i ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                  )}
                >
                  <span className="text-xl">{step.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-body font-semibold uppercase tracking-wider', stepIdx === i ? 'text-brand-500' : 'text-stone-400')}>
                      {t(step.label)}
                    </p>
                    {sel
                      ? <p className="text-sm font-body font-medium text-stone-800 dark:text-stone-100 truncate">{sel.name}</p>
                      : <p className="text-xs font-body text-stone-400">{t('builder.selectItem')}</p>
                    }
                  </div>
                  {sel ? <Check size={16} className="text-brand-500 flex-shrink-0" /> : <ChevronRight size={14} className="text-stone-300 flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Running total */}
          <div className="bg-stone-900 dark:bg-stone-800 rounded-2xl p-5 text-white">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">{t('builder.running')}</p>
            <p className="font-serif text-3xl text-white mb-4">{format(runningTotal)}</p>
            <div className="space-y-2 mb-4">
              {STEPS.map(step => {
                const sel = selections[step.key]
                return (
                  <div key={step.key} className="flex items-center justify-between text-sm">
                    <span className="font-body text-stone-400 flex items-center gap-1.5">
                      {step.icon} {t(step.label)}
                    </span>
                    <span className={cn('font-body', sel ? 'text-white font-medium' : 'text-stone-600')}>
                      {sel ? format(sel.price) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
            <Button
              onClick={addBundleToCart}
              disabled={completedCount === 0}
              className="w-full gap-2"
            >
              <ShoppingBag size={16} /> {t('builder.addAllToCart')}
            </Button>
            <button onClick={clear} className="w-full mt-2 text-xs font-body text-stone-500 hover:text-stone-300 flex items-center justify-center gap-1 py-2 transition-colors">
              <RotateCcw size={12} /> {t('builder.clear')}
            </button>
          </div>

          {/* Selection previews */}
          {STEPS.filter(s => selections[s.key]).map(step => {
            const sel = selections[step.key]
            return (
              <div key={step.key} className="flex items-center gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
                <img
                  src={sel.image} alt={sel.name}
                  className="w-12 h-12 rounded-xl object-cover"
                  onError={e => { e.target.src = 'https://placehold.co/48x48/e7e5e4/78716c?text=?' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-body text-stone-400">{t(step.label)}</p>
                  <p className="text-xs font-body font-medium text-stone-800 dark:text-stone-100 truncate">{sel.name}</p>
                </div>
                <button onClick={() => setSelections(s => ({ ...s, [step.key]: null }))} className="text-stone-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Right: Product grid */}
        <div className="lg:col-span-3">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{currentStep.icon}</span>
            <div>
              <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">{t(currentStep.label)}</h2>
              <p className="font-body text-sm text-stone-400">{stepProducts.length} options available</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                <button
                  onClick={() => setStepIdx(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    stepIdx === i ? 'w-6 bg-brand-500' : selections[step.key] ? 'bg-brand-300' : 'bg-stone-200 dark:bg-stone-700'
                  )}
                />
              </div>
            ))}
          </div>

          {/* Products */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {stepProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <BuilderCard
                    product={product}
                    selected={selected?.id === product.id}
                    onSelect={selectProduct}
                    format={format}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Next / Prev step */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setStepIdx(i => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="text-sm font-body text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 disabled:opacity-30 transition-colors"
            >
              ← {t('common.prev')}
            </button>
            <p className="text-xs font-body text-stone-400">{stepIdx + 1} / {STEPS.length}</p>
            {stepIdx < STEPS.length - 1
              ? <Button size="sm" onClick={() => setStepIdx(i => i + 1)}>{t('common.next')} →</Button>
              : <Button size="sm" onClick={addBundleToCart} disabled={completedCount === 0} className="gap-1.5"><ShoppingBag size={14} /> {t('builder.addAllToCart')}</Button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
