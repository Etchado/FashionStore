import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { sessionId, items, shipping, userId } = await req.json()

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return new Response(JSON.stringify({ error: 'Payment not completed' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Use Stripe's authoritative total — never trust the client
  const total = session.amount_total! / 100
  const num = `AU-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`

  const lineItems = items.map((i: any) => ({
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

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ orderNumber: order.order_number }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
