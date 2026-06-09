# AGENT REGISTRY — REDLANTERN STUDIOS
**Version:** 2.0 | **Last updated:** 2026-06-08
**Purpose:** Canonical source of truth for all active agents — IDs, models, roles, MCP assignments, and routing.

---

## LAYER 0 — ORCHESTRATION

| Agent | ID | Model | Role | MCP Servers |
|-------|----|-------|------|-------------|
| RUNTIME | bed545df | claude-sonnet-4-6 | Main command interface. Routes sessions, coordinates agents, owns direction. | GitHub (HireWire) |
| ROBBY | robby-conductor-001 | claude-sonnet-4-6 | Lifecycle conductor. Enforces phases, generates receipts, detects blockers. | GitHub (HireWire), Filesystem |

---

## LAYER 1 — SENIOR SPECIALISTS

| Agent | ID | Model | Role | Routes from |
|-------|----|-------|------|-------------|
| PM | 3087cb45 | claude-sonnet-4-6 | Product management. Writes stories, locks scope, owns decisions. | RUNTIME |
| ARCHITECT | a4c9f2e1 | claude-sonnet-4-6 | System architecture, technical design, ADRs. | RUNTIME, PM |
| DESIGN | 1ae4f248 | claude-sonnet-4-6 | UI/UX, v0 prompts, design system, brand compliance. | PM, RUNTIME |
| SECURITY | 3c9d2f8b | claude-sonnet-4-6 | Auth review, RLS audit, vulnerability analysis, security gates. | ARCHITECT, REVIEW |
| COMPLIANCE | c5a2d9f3 | claude-sonnet-4-6 | Privacy, legal, data handling compliance. | PM, SECURITY |

---

## LAYER 2 — EXECUTION

| Agent | ID | Model | Role | Routes from |
|-------|----|-------|------|-------------|
| FRONTEND | 65de47a2 | claude-sonnet-4-6 | UI implementation, React/Next.js, wiring design to code. | DESIGN, PM |
| BACKEND | default | claude-sonnet-4-6 | API, DB, server logic, Supabase, RLS implementation. | PM, ARCHITECT |
| DATA | d7b3c8a5 | claude-sonnet-4-6 | Schema design, migrations, data modeling. | ARCHITECT, BACKEND |
| INFRA | f9a2b4c7 | claude-sonnet-4-6 | Infrastructure, DevOps, PM2, CI/CD, performance. | ARCHITECT, DEPLOY |
| DEPLOY | 7ac01029 | claude-sonnet-4-6 | Merges, deploys to production, pre-deploy checklist. | REVIEW, QA, RUNTIME |

---

## LAYER 3 — QUALITY & VERIFICATION

| Agent | ID | Model | Role | Routes from |
|-------|----|-------|------|-------------|
| REVIEW | 943d1ebc | claude-sonnet-4-6 | Pre-merge code review. Correctness, regressions, secrets. | RUNTIME, PM |
| QA | d011c7b9 | claude-sonnet-4-6 | User flow validation, acceptance testing, spot checks. | REVIEW, PM |
| DEBUG | b374bcb5 | claude-sonnet-4-6 | Bug investigation, root cause analysis, environment issues. | RUNTIME, REVIEW |
| TRUTH | 7a4b9c1d | claude-sonnet-4-6 | Audit, verification, quality enforcement. | ROBBY, RUNTIME |
| OBSERVE | 68f3d9d6 | claude-sonnet-4-6 | Post-ship monitoring, 24h watch, anomaly detection. | DEPLOY, RUNTIME |

---

## LAYER 4 — SUPPORT & ENRICHMENT

| Agent | ID | Model | Role | Routes from |
|-------|----|-------|------|-------------|
| ANALYTICS | 8b4c7d9e | claude-sonnet-4-6 | Analytics instrumentation, metrics, event tracking. | PM, BACKEND |
| RESEARCH | 5e5ea5c8 | claude-sonnet-4-6 | User research, synthesis, competitive analysis. | PM, DESIGN |
| CONTENT | e2f4a8b9 | claude-sonnet-4-6 | Copywriting, UX copy, content strategy. | DESIGN, PM |
| ACCESSIBILITY | a1c2e3f4 | claude-sonnet-4-6 | Accessibility, a11y, WCAG compliance. | FRONTEND, REVIEW |
| TECHWRITER | 7ec4d0f2 | claude-sonnet-4-6 | Documentation, audit, writing. | PM, HANDOFF |
| HANDOFF | 9f2b8e4a | claude-sonnet-4-6 | Documentation, context management, session handoffs. | RUNTIME, ROBBY |
| CHANGE | 6c4a9e2d | claude-sonnet-4-6 | Release management, changelogs, communication. | DEPLOY, PM |

---

## ROUTING QUICK REFERENCE

```
New feature request     → PM
UI/UX work              → DESIGN → FRONTEND
Backend/API/DB work     → BACKEND
Schema/migration        → DATA
Infra/DevOps            → INFRA
Pre-merge check         → REVIEW
User flow validation    → QA
Bug or root cause       → DEBUG
Deploy to production    → DEPLOY
Post-ship monitoring    → OBSERVE
Security/RLS audit      → SECURITY
Compliance/privacy      → COMPLIANCE
Content/copy            → CONTENT
Docs/handoff            → TECHWRITER → HANDOFF
Analytics events        → ANALYTICS
User research           → RESEARCH
A11y review             → ACCESSIBILITY
Release notes           → CHANGE
Architecture decisions  → ARCHITECT
Audit/verification      → TRUTH
Lifecycle enforcement   → ROBBY
```

---

## MCP SERVER ASSIGNMENTS

| MCP Server | Assigned agents |
|------------|----------------|
| GitHub (HireWire) | RUNTIME, ROBBY, DEPLOY, REVIEW |
| Filesystem | ROBBY (fixed 2026-06-08 — was 0 servers) |

**Note:** ROBBY had zero MCP servers prior to 2026-06-08. This was the root cause of all filesystem tool call failures. Fixed in Day 3 session.

---

## INFRASTRUCTURE CONFIG

| Service | Value |
|---------|-------|
| Supabase project | `endovljmaudnxdzdapmf` (RedLantern Studios) |
| GitHub org/repo (Amina) | `rsemeah/redlanternstudios` (renamed 2026-06-08) |
| SwarmClaw runtime | `localhost:3456` |
| Process manager | PM2 (installed 2026-06-08) |
| Startup hook | launchd (`~/Library/LaunchAgents/`) |
| PM2 install path | `/usr/local/lib/node_modules/pm2` |

---

## REBUILD INSTRUCTIONS

If the agent registry needs to be reconstructed:
1. Pull agent list from SwarmClaw UI → Settings → Agents
2. Cross-reference IDs against active chatroom sessions
3. Verify MCP server assignments in each agent's settings panel
4. Update the table above and commit to `rsemeah/Amina` main
5. Notify ROBBY — he enforces routing based on this file

---

*Maintained by: RUNTIME + ROBBY | Rebuild trigger: any agent addition, removal, or MCP change*
