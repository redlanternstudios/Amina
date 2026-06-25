# AGENT_PERMISSIONS.md — Agent Tier Assignments

**Last Updated:** 2026-06-13
**Authority:** Guardrail Stack v2.1 / Module 7

---

## Tier 1 — Autonomous (no approval needed)

| Agent | Scope |
|-------|-------|
| RUNTIME | Coordination, verification, ops enforcement |

## Tier 2 — Requires Review Gate

| Agent | Scope | Reviewer |
|-------|-------|----------|
| FRONTEND | UI components, pages, styles | REVIEW |
| BACKEND | API routes, DB migrations, services | REVIEW |
| DESIGN | Component design, v0 prompts | PM |

## Tier 3 — Requires Sign-off

| Agent | Scope | Approver |
|-------|-------|----------|
| DEPLOY | Production deploys | PM + REVIEW |
| QA | Test sign-off | REVIEW |

## Tier 4 — Governance (Independent)

| Agent | Role |
|-------|------|
| TRUTH | Fact verification — cannot be overridden |
| SECURITY | Security audit — cannot be overridden |
| CHANGE | Change approval board — cannot be overridden |
| COMPLIANCE | Regulatory compliance — cannot be overridden |

---

## Rules

1. **No self-approval**: Proposing agent cannot approve their own change
2. **Tier 2 → Tier 4**: Must pass 1+ Tier 3 gate before Tier 4 sign-off
3. **Governance override**: ROBBY cannot override TRUST, SECURITY, CHANGE, or COMPLIANCE
4. **Parked product lock**: No Tier 2+ work on parked products
