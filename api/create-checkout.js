import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { items, shippingTotal } = req.body
  const appUrl = process.env.VITE_APP_URL || 'https://fashion-store-lux.vercel.app'

  const lineItems = items.map(item => ({
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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
