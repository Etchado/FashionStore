import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export function ReviewForm({ productId, onSubmit }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <p className="text-sm font-body text-stone-500">{t('auth.signIn')} to write a review.</p>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return
    setLoading(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      })
      if (error) throw error
      addToast(t('toast.addedToCart').replace('cart', 'review'))
      setRating(0); setComment('')
      onSubmit?.()
    } catch {
      addToast(t('toast.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(s => (
          <button
            key={s} type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}
          >
            <Star
              size={24}
              fill={(hover || rating) >= s ? 'currentColor' : 'none'}
              className={cn('transition-colors', (hover || rating) >= s ? 'text-brand-400' : 'text-stone-300')}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        placeholder="Share your thoughts..."
        className="w-full text-sm font-body bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-400 text-stone-800 dark:text-stone-100 placeholder-stone-400 resize-none"
      />
      <Button type="submit" disabled={rating === 0 || loading} size="sm">
        {loading ? t('common.loading') : t('product.writeReview')}
      </Button>
    </form>
  )
}
