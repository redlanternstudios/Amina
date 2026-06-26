# Cleanup Audit: Muslim Texas + Saudi Journey

**Date:** 2026-06-17
**Branch:** backend/amina/cleanup-mt-sj
**Repo:** /Users/rorysemeah/amina
**Supabase Project:** endovljmaudnxdzdapmf

## Scope
Remove ALL Muslim Texas and Saudi Journey related content from Amina.

## Results

### Codebase Scan
- File/directory search for `muslim_texas`, `muslimtexas`, `saudi_journey`, `saudijourney`: **0 matches** across 93 files/dirs
- Content search in `.tsx`, `.ts`, `.js`, `.css`, `.sql` files: **0 references**
- Supabase migration files (001-007): **0 references**
- Generic "New Muslim Guidance" marketing card found — this is generic, not feature-specific

### Git History
- **No files** matching these features ever committed to this repo
- Commit `1d7a544` confirms "Saudi Journey renamed to Hajj & Umrah" was already done
- Git stash listing showed the rename commit already applied

### Scope-Lock Doc
- `AMINA_SCOPE_LOCK_V2.md` lists Muslim Texas removal as a **completed AC** (already done prior)

### Live Supabase Schema
- Could not directly query project `endovljmaudnxdzdapmf` — no service role key available in local env files
- No migration files reference either feature, so if tables exist they'd be manual additions outside migration history

## Verdict
**Nothing to clean.** Both features were never built in this codebase, or were already renamed/removed in prior commits. The rename "Saudi Journey → Hajj & Umrah" was already committed. Muslim Texas was already recorded as removed in the scope-lock doc.

## Branch
- Created branch `backend/amina/cleanup-mt-sj` on 2026-06-17
- Audit document committed
- No code deletions performed (nothing to delete)
