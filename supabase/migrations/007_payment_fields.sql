-- Migration: Add payment fields to user_profiles
-- Supports both RevenueCat (iOS IAP) and Stripe (web)
-- Run: Supabase SQL editor or supabase db push

alter table public.user_profiles
  add column if not exists stripe_customer_id        text,
  add column if not exists stripe_subscription_id    text,
  add column if not exists subscription_expires_at   timestamptz,
  add column if not exists subscription_status       text not null default 'free';

-- Index for Stripe webhook lookups
create index if not exists idx_user_profiles_stripe_subscription_id
  on public.user_profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- Allowed subscription_status values (informational — enforced in app layer)
-- 'free' | 'active' | 'cancelled' | 'expired' | 'past_due'
comment on column public.user_profiles.subscription_status is
  'free | active | cancelled | expired | past_due';
