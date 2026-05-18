import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LOCAL_PRODUCTS } from '@/data/products'

const ProductsContext = createContext(null)

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
          setProducts(data.map(p => ({
            ...p,
            inStock: p.in_stock,
            stockCount: p.stock_count,
            reviewCount: p.review_count,
            originalPrice: p.original_price,
            variants: p.product_variants || [],
            badges: p.badges || [],
          })))
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
