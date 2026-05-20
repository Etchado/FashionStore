import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, items, shipping, userId } = req.body

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    // Use Stripe's authoritative total — never trust the client
    const total = session.amount_total / 100
    const num = `AU-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
    )

    const lineItems = items.map(i => ({
      product_id: i.productId,
      name: i.name,
      variant_label: i.variantLabel || null,
      price: i.price,
      qty: i.qty,
    }))

    const { data: order, error } = await supabase.rpc('place_order', {
      p_user_id: userId || null,
      p_order_number: num,
      p_total: total,
      p_shipping: shipping,
      p_items: lineItems,
    })

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ orderNumber: order.order_number })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
