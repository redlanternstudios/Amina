# AGENT REGISTRY — REDLANTERN STUDIOS
**Version:** 2.1 | **Last updated:** 2026-06-09
**Purpose:** Canonical source of truth for all active agents, IDs, models, MCP assignments, and routing.
**Rule:** If AGENT_REGISTRY conflicts with a soul file, the soul file wins. Update this file after every agent change.

---

## OPERATING DOCTRINE

**All agents must read and operate under:**
- [`AGENT_THOUGHT_PROCESS_v2.0.md`](redlantern-build-team/AGENT_THOUGHT_PROCESS_v2.0.md) — Preflight, Risk Tier classification, Collision Detection, all 5 Layers, Handoff Package, Final Review Checklist. **Non-negotiable. No exceptions.**
- [`AMINA_NORTH_STAR_v1.0.md`](AMINA_NORTH_STAR_v1.0.md) — Decision authority tiers. Check before escalating to Ro.

**Routing rule:** Before asking Ro anything, check NORTH_STAR. If it's a Tier 1 decision — make the call. Tier 2 — one sentence recommendation + one sentence reason. Tier 3 only — full escalation.

---

## LAYER 0 — ORCHESTRATION

| Agent | ID | Model | MCP Servers | Owns |
|-------|----|-------|-------------|------|
| RUNTIME | bed545df | claude-sonnet-4-6 | GitHub/HireWire | Routes sessions, coordinates agents, owns direction |
| ROBBY | robby-conductor-001 | claude-sonnet-4-6 | GitHub/HireWire | Lifecycle enforcement, receipts, phase gates, blocker detection |

---

## LAYER 1 — SENIOR SPECIALISTS

| Agent | ID | Model | MCP Servers | Owns |
|-------|----|-------|-------------|------|
| PM | 3087cb45 | claude-sonnet-4-6 | GitHub/HireWire | Stories, scope lock, decision files, PM decisions |
| ARCHITECT | a4c9f2e1 | claude-sonnet-4-6 | GitHub/HireWire | System design, architecture decisions, ADRs |
| DESIGN | 1ae4f248 | claude-sonnet-4-6 | GitHub/HireWire | UI/UX, v0 prompts, brand compliance |
| SECURITY | 3c9d2f8b | claude-sonnet-4-6 | GitHub/HireWire | Auth review, RLS audit, vulnerability analysis |
| COMPLIANCE | c5a2d9f3 | claude-sonnet-4-6 | GitHub/HireWire | Legal, privacy, GDPR/CCPA review |

---

## LAYER 2 — EXECUTION

| Agent | ID | Model | MCP Servers | Owns |
|-------|----|-------|-------------|------|
| FRONTEND | 65de47a2 | claude-sonnet-4-6 | GitHub/HireWire | React/Next.js, UI wiring, component builds |
| BACKEND | default | claude-sonnet-4-6 | GitHub/HireWire | API, DB, server logic, Supabase integration |
| DATA | d7b3c8a5 | claude-sonnet-4-6 | GitHub/HireWire | Schema design, migrations, query optimization |
| INFRA | f9a2b4c7 | claude-sonnet-4-6 | GitHub/HireWire | DevOps, PM2, CI/CD, performance |
| DEPLOY | 7ac01029 | claude-sonnet-4-6 | GitHub/HireWire | Merges, deploys, environment promotion |

---

## LAYER 3 — VERIFICATION

| Agent | ID | Model | MCP Servers | Owns |
|-------|----|-------|-------------|------|
| REVIEW | 943d1ebc | claude-sonnet-4-6 | GitHub/HireWire | Pre-merge diff review, correctness, regression check |
| QA | d011c7b9 | claude-sonnet-4-6 | GitHub/HireWire | User flow validation, acceptance criteria |
| DEBUG | b374bcb5 | claude-sonnet-4-6 | GitHub/HireWire | Root cause analysis, bug fixes, environment issues |
| TRUTH | 7a4b9c1d | claude-sonnet-4-6 | GitHub/HireWire | Audit, verification, claims vs reality |
| ACCESSIBILITY | a1c2e3f4 | claude-sonnet-4-6 | GitHub/HireWire | WCAG, a11y review |

---

## LAYER 4 — SUPPORT

| Agent | ID | Model | MCP Servers | Owns |
|-------|----|-------|-------------|------|
| ANALYTICS | 8b4c7d9e | claude-sonnet-4-6 | GitHub/HireWire | Instrumentation, metrics, event tracking |
| OBSERVE | 68f3d9d6 | claude-sonnet-4-6 | GitHub/HireWire | Post-ship monitoring, 24h watch, anomaly detection |
| RESEARCH | 5e5ea5c8 | claude-sonnet-4-6 | GitHub/HireWire | User research, synthesis, competitive analysis |
| CONTENT | e2f4a8b9 | claude-sonnet-4-6 | GitHub/HireWire | Copywriting, UX copy, faith-appropriate language |
| HANDOFF | 9f2b8e4a | claude-sonnet-4-6 | GitHub/HireWire | Documentation, context management, session handoffs |
| TECHWRITER | 7ec4d0f2 | claude-sonnet-4-6 | GitHub/HireWire | Technical documentation, READMEs, audit trails |
| CHANGE | 6c4a9e2d | claude-sonnet-4-6 | GitHub/HireWire | Release management, changelog, comms |

---

## ROUTING MATRIX

| Request type | Route to |
|-------------|----------|
| New feature request | PM → write the story |
| UI/UX work | DESIGN → v0 prompt → FRONTEND |
| Backend / API / DB | BACKEND |
| Schema / migration | DATA |
| Pre-merge check | REVIEW |
| User flow validation | QA |
| Bug / root cause | DEBUG |
| Deploy to production | DEPLOY |
| Post-ship monitoring | OBSERVE |
| Auth / RLS / security | SECURITY |
| Compliance / privacy | COMPLIANCE |
| Analytics / tracking | ANALYTICS |
| Content / copy | CONTENT |
| Architecture decision | ARCHITECT |
| Documentation | TECHWRITER or HANDOFF |
| Release notes | CHANGE |

---

## AGENT THOUGHT PROCESS — ROUTING BY ROLE

Every agent applies `AGENT_THOUGHT_PROCESS_v2.0.md`. Role-specific addendums:

| Role | Addendum section |
|------|-----------------|
| FRONTEND | Frontend Agent addendum — responsive, a11y, brand, states, component reuse |
| BACKEND | Backend Agent addendum — schema integrity, RLS, rate limits, idempotency |
| AI/Amina core | AI Agent addendum — prompt safety, hallucination bounds, cost ceiling, religious content |
| QA | QA Agent addendum — regression matrix, abuse tests, edge case matrix, Pass/Fail output |
| PM | PM Agent addendum — scope control, launch sequencing, success metrics, user promise |
| SECURITY | Security Agent addendum — secrets, permissions, abuse vectors, dependency audit |

---

## KNOWN ISSUES — 2026-06-08

- **ROBBY had zero MCP servers** — root cause of all filesystem tool failures. Fixed 2026-06-08. MCP: GitHub/HireWire now assigned.
- **401 invalid x-api-key** — recurring in SwarmClaw runs. Fix: re-inject Anthropic API key via System → Providers. Tier 1 decision — agents fix without asking Ro.
- **AGENT_REGISTRY was stale** — reflected 12 agents, not 24. Fixed in v2.0 on 2026-06-08.

---

## REBUILD INSTRUCTIONS

If an agent needs to be recreated:
1. Check soul file in `redlantern-build-team/souls/` in QBos repo
2. Assign MCP: GitHub/HireWire (minimum)
3. Set model: claude-sonnet-4-6
4. Load `AGENT_THOUGHT_PROCESS_v2.0.md` into system prompt or context
5. Register ID here after creation
6. Notify RUNTIME

---

*Maintained by: RUNTIME + ROBBY after each session. Any agent may propose an edit via PR.*
