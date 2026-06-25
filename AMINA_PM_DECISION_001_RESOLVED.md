# AMINA_PM_DECISION_001_RESOLVED — DB Architecture Decision

**Status:** RESOLVED  
**Decision by:** PM  
**Resolved:** 2026-06-09  
**Blocks cleared:** Circle build stories

---

## Decision: Option A — Single Shared DB

---

## Rationale

Amina is pre-launch. The engineering cost of per-circle DB isolation (Option B) does not justify the benefit at this stage. A single shared database with row-level security (RLS) enforces tenant isolation reliably and is the industry standard for early-stage multi-tenant products. If Amina reaches scale or a compliance requirement forces isolation (HIPAA/SOC2), a migration path to Option B exists — but that decision point is not now.

---

## Constraints on BACKEND

1. **RLS required** — every table that stores circle-scoped data must have row-level security policies enabled before any Circle build story ships
2. **No cross-circle queries** — application layer must never issue queries that return rows across circle boundaries without explicit admin scope
3. **Schema conventions** — all circle-scoped tables must include a `circle_id` foreign key; this is non-negotiable
4. **Migration discipline** — all schema changes go through versioned migrations (no manual `ALTER TABLE` in prod)

---

## Circle Build Unblocked

Circle build stories may now proceed. BACKEND must confirm RLS policy scaffold exists before first Circle data story merges.

---

## Enforcement

Robby receipts this file as the gate-clear. RUNTIME routes Circle build stories to PM → BACKEND.
