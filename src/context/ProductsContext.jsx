import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LOCAL_PRODUCTS } from '@/data/products'

const ProductsContext = createContext(null)

const LOCAL_MAP = Object.fromEntries(LOCAL_PRODUCTS.map(p => [p.id, p]))

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(LOCAL_PRODUCTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFromSupabase = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_variants(*)')
          .order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          setProducts(data.map(p => {
            const local = LOCAL_MAP[p.id]
            return {
              ...p,
              inStock: p.in_stock,
              stockCount: p.stock_count,
              reviewCount: p.review_count,
              originalPrice: p.original_price,
              variants: p.product_variants?.length ? p.product_variants : (local?.variants || []),
              badges: p.badges || [],
              image: local?.image || p.image,
              images: local?.images || p.images,
            }
          }))
        }
      } catch {
        // fallback to local data silently
      } finally {
        setLoading(false)
      }
    }
    fetchFromSupabase()
  }, [])

  const getProduct = (id) => products.find(p => p.id === id || p.id === String(id))

  const getByCategory = (category) =>
    category ? products.filter(p => p.category === category) : products

  return (
    <ProductsContext.Provider value={{ products, loading, getProduct, getByCategory }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => useContext(ProductsContext)
