/**
 * Stripe webhook → Supabase sync (web subscriptions)
 *
 * Events handled:
 * - checkout.session.completed → grant premium
 * - customer.subscription.deleted → revoke premium
 * - invoice.payment_failed → flag billing issue
 *
 * Setup:
 * 1. Stripe Dashboard → Developers → Webhooks → Add endpoint
 * 2. URL: https://YOUR_DOMAIN/api/stripe/webhook
 * 3. Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
 * 4. Copy signing secret → STRIPE_WEBHOOK_SECRET env var
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id ?? session.client_reference_id
      if (!userId) break

      const sub = session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription as string)
        : null

      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_type: 'premium',
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: sub?.id ?? null,
          current_period_start: sub ? new Date((sub as any).current_period_start * 1000).toISOString() : null,
          current_period_end: sub ? new Date((sub as any).current_period_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      await supabase
        .from('amina_profiles')
        .update({ has_full_access: true })
        .eq('id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)

      // Revoke access — look up user_id first
      const { data: record } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', sub.id)
        .single()

      if (record?.user_id) {
        await supabase
          .from('amina_profiles')
          .update({ has_full_access: false })
          .eq('id', record.user_id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const invoiceSubId = (invoice as any).subscription as string | undefined
      if (invoiceSubId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', invoiceSubId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
