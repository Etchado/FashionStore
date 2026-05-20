import Stripe from 'https://esm.sh/stripe@14?target=deno'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

  const { items, shippingTotal } = await req.json()

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        ...(item.variantLabel ? { description: item.variantLabel } : {}),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.qty,
  }))

  if (shippingTotal > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Standard Shipping' },
        unit_amount: Math.round(shippingTotal * 100),
      },
      quantity: 1,
    })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${appUrl}/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout`,
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
