# AMINA_PM_DECISION_001 — DB Architecture Decision

**Status:** OPEN  
**Routed to:** PM  
**Blocking:** Circle build stories  
**Created:** 2026-06-09

---

## Decision Required

Choose the Amina database architecture before Circle build stories begin.

---

## Option A — Single Shared DB

- One database for all users/circles
- Simpler infrastructure, lower cost
- Row-level security enforces data isolation
- Standard for early-stage products

**Tradeoffs:** Harder to shard later; tenant bleed risk if RLS misconfigured.

---

## Option B — Per-Circle DB (Multi-Tenant Isolated)

- Each circle gets its own database instance
- Maximum isolation — no cross-tenant risk
- Easier compliance story (HIPAA, SOC2 paths)
- Higher infra cost and operational complexity

**Tradeoffs:** More expensive to run; harder to query across circles.

---

## PM Action Required

1. Make the call: **A or B**
2. Write `AMINA_PM_DECISION_001_RESOLVED.md` with:
   - Decision (A or B)
   - Rationale (2–4 sentences)
   - Any constraints imposed on BACKEND
3. Notify RUNTIME when file is committed

**Do not start Circle build stories until `AMINA_PM_DECISION_001_RESOLVED.md` exists in the repo.**

---

## Enforcement

Robby enforces: no `_RESOLVED.md` = Circle build stays blocked. No exceptions.
