# Amina — Supabase Migration Guide

## Project: `endovljmaudnxdzdapmf`

## Migrations to Run (in order)

### Step 1: `001_initial_schema.sql` ✅ ALREADY RUN
profiles, conversations, messages, reflections, duas, journal_entries tables

### Step 2: `002_chat_persistence_fix.sql` — NEEDS TO RUN
Adds `touch_conversation_updated_at()` trigger. Fixes chat persistence.

### Step 3: `003_circle_schema.sql` — SKIP (superseded)
Use `003_circles_intimate_groups.sql` instead (the rebuild version)

### Step 4: `003_circles_intimate_groups.sql` — NEEDS TO RUN (renumber to 003)
The canonical Circle schema: invite-only groups with topic-restricted categories.
Creates: circles, circle_members, circle_posts, circle_reactions tables + RLS + indexes.
NOTE: This file is identical to `007_circle_rebuild_intimate_groups.sql`.

### Step 5: `004_circle_invites.sql` — NEEDS TO RUN
Adds: circle_invites table with invite codes, RLS policies.

### Step 6: `004_moderation_queue.sql` — NEEDS TO RUN
Adds: moderation_queue table for Sightengine-flagged images.

### Step 7: `005_circle_soft_delete.sql` — NEEDS TO RUN
Adds: deleted_at column to circles, updates RLS to exclude soft-deleted.

### Step 8: `005_circle_invites_notifications.sql` — SKIP (superseded by 004_circle_invites.sql)
Creates circle_invites and circle_notifications — duplicate of 004_circle_invites.sql.
circle_notifications table is a nice-to-have but not blocking.

### Step 9: `006_circle_storage_bucket.sql` — NEEDS TO RUN
Creates: circle-media storage bucket (10MB, image/video) + RLS policies.

### Step 10: `007_circle_rebuild_intimate_groups.sql` — SKIP (identical to 003_circles_intimate_groups)

## Canonical Execution Order (clean)

1. `002_chat_persistence_fix.sql` — chat trigger
2. `003_circles_intimate_groups.sql` — circle tables + RLS + indexes
3. `004_circle_invites.sql` — invite codes
4. `004_moderation_queue.sql` — image moderation
5. `005_circle_soft_delete.sql` — soft delete
6. `006_circle_storage_bucket.sql` — storage bucket

Skip: `003_circle_schema.sql` (superseded), `005_circle_invites_notifications.sql` (duplicate), `007_circle_rebuild_intimate_groups.sql` (identical to 003_circles_intimate_groups)

## Method
Open Supabase Dashboard → SQL Editor → paste each file in order → Run.
