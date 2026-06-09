# AGENT REGISTRY — REDLANTERN STUDIOS
**Version:** 2.0 | **Last updated:** 2026-06-08
**Purpose:** Canonical source of truth for all active agents, IDs, models, MCP assignments, and routing.
**Rule:** If AGENT_REGISTRY conflicts with a soul file, the soul file wins. Update this file after every agent change.

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

## KNOWN ISSUES — 2026-06-08

- **ROBBY had zero MCP servers** — root cause of all filesystem tool failures. Fixed 2026-06-08. MCP: GitHub/HireWire now assigned.
- **401 invalid x-api-key** — recurring in SwarmClaw runs. Fix: re-inject Anthropic API key via System → Providers. Tier 1 decision — agents fix without asking Ro.
- **AGENT_REGISTRY was stale** — reflected 12 agents, not 24. This file is v2.0, correct as of 2026-06-08.

---

## REBUILD INSTRUCTIONS

If an agent needs to be recreated:
1. Check soul file in `redlantern-build-team/souls/` in QBos repo
2. Assign MCP: GitHub/HireWire (minimum)
3. Set model: claude-sonnet-4-6
4. Register ID here after creation
5. Notify RUNTIME

---

*Maintained by: RUNTIME + ROBBY after each session. Any agent may propose an edit via PR.*
