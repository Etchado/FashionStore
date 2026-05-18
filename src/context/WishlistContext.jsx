import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

function loadLocal() {
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]') } catch { return [] }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [ids, setIds] = useState(loadLocal)

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(ids))
  }, [ids])

  useEffect(() => {
    if (!user) return
    const sync = async () => {
      const { data } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id)
      const dbIds = (data || []).map(r => r.product_id)
      const merged = [...new Set([...ids, ...dbIds])]
      setIds(merged)
      const local = loadLocal()
      const toInsert = local.filter(id => !dbIds.includes(id)).map(id => ({ user_id: user.id, product_id: id }))
      if (toInsert.length) await supabase.from('wishlists').upsert(toInsert)
    }
    sync()
  }, [user])

  const toggle = useCallback(async (productId) => {
    const has = ids.includes(productId)
    if (has) {
      setIds(prev => prev.filter(id => id !== productId))
      if (user) await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId)
    } else {
      setIds(prev => [...prev, productId])
      if (user) await supabase.from('wishlists').upsert({ user_id: user.id, product_id: productId })
    }
    return !has
  }, [ids, user])

  const isWishlisted = (id) => ids.includes(id)

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWishlisted, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
