/**
 * Stripe checkout session — WEB ONLY
 *
 * This route is for users subscribing via the Amina web app.
 * Do NOT call this from inside the iOS Capacitor app — Apple IAP required there.
 *
 * Flow: POST /api/stripe/checkout → returns { url } → redirect user to Stripe hosted checkout
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const priceId: string = body.priceId ?? process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email,
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
    metadata: {
      supabase_user_id: user.id,
    },
  })

  return NextResponse.json({ url: session.url })
}
