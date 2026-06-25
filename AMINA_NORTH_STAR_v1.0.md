# AMINA — NORTH STAR + AGENT DECISION AUTHORITY
**Version:** 1.0 | **Date:** 2026-06-08
**Purpose:** Prevent agents from escalating decisions Ro has already answered by pattern.
**Rule:** Before asking Ro ANYTHING, check this file. If the answer is inferable — infer it and proceed.

---

## WHO RO IS (BUILD PATTERN)

- Moves fast. Prefers shipped over perfect.
- Dogfood phase = acceptable imperfection. Production phase = tighten everything.
- Trusts agents to make logical calls. Escalates only when the decision is irreversible or strategic.
- Hates being asked questions that have an obvious answer given the context.
- North star: prove QuietBuild OS works via Amina, then apply the same OS to HireWire.

---

## TIER 1 — AGENTS DECIDE, DO NOT ASK RO

These are logical, inferable, or reversible. Agents make the call and document their reasoning.

### Architecture / Infrastructure
- **Shared DB vs separate DB during dogfood:** Use shared DB. Add RLS audit to DoD. Split only when Amina has real users or a security requirement forces it.
- **Table naming conflicts (e.g. `companion_conversations` vs `amina_conversations`):** Use the `amina_*` prefixed table. Deprecate or alias the other. Document the decision.
- **Missing env vars or config:** Check the repo `.env.example` or `README`. If still missing, check Supabase project settings. Do not ask Ro.
- **Port conflicts:** Kill the conflicting process, document which PID and why.
- **PM2 / process manager path issues:** Use `find ~ -maxdepth 5 -name "package.json"` to locate repos. Use `sudo` if permissions block global installs.
- **Which Supabase project to use for Amina:** `endovljmaudnxdzdapmf` (RedLantern Studios). Always.
- **Which GitHub repo for Amina:** `rsemeah/redlanternstudios`. Always.

### Product / Feature decisions
- **Feature priority within a spec:** Follow P0 → P1 → P2 order in the mission brief. Do not reorder without a reason.
- **Whether to add a column or create a new table:** If it's a new entity, new table. If it's an attribute of an existing entity, new column. Standard normalization rules apply.
- **Faith-appropriate content defaults:** Conservative. No generic emoji reactions — use `ameen / subhanallah / alhamdulillah / mashallah / heart`. No explicit content. Flag, don't auto-delete.
- **Brand decisions (color, type, tone):** Follow `AMINA_IMAGE_MANIFEST.md` brand kit exactly. Soft Cream `#F7F2EB`, Dusty Rose `#D6AAA3`, Soft Olive `#8E9878`, Muted Gold `#D7BA82`. Canela display, Inter body.
- **User-facing placeholder names:** Always dynamic. Never hardcode "Candace" or any persona name.
- **RLS on new tables:** Always enabled. Never ship a table without RLS. Default deny. Explicit grants only.

### Debug / QA decisions
- **Which table is canonical when two conflict:** The one prefixed `amina_*`. Document the deprecation.
- **Whether to fix or flag:** Fix if under 30 minutes. Flag if architectural. Never block on a flag — ship the fix path alongside the flag.
- **Empty tables with broken UI wiring:** Assume the table is correct, the wiring is wrong. Fix the wiring first.
- **401 API errors in SwarmClaw:** Re-inject the Anthropic API key via System → Providers in SwarmClaw UI. Do not ask Ro for the key — it's already in the system.

---

## TIER 2 — AGENTS RECOMMEND, RO APPROVES (ONE SENTENCE)

These have meaningful consequences but Ro should only need to say yes/no.

- Deleting or dropping a production table with data
- Changing Amina's core data model (entities, not columns)
- Adding a new third-party integration or paid service
- Changing the GitHub repo name or Supabase project
- Modifying RLS policy on a table with live user data
- Any decision that affects HireWire tables in the shared DB

**Format for Tier 2 escalation:**
> "Recommendation: [one sentence]. Reason: [one sentence]. Do you approve? Yes/No."

No context dumps. No option lists. One recommendation, one reason.

---

## TIER 3 — ALWAYS ESCALATE TO RO

- Strategic product pivots
- Pricing, monetization, or revenue model changes
- External partnerships or vendor contracts
- Anything touching a real user's personal or financial data
- Security incidents

---

## AMINA PRODUCT NORTH STAR

**What Amina is:** Faith-centered reflection and community app for Muslim women.
**What it is not:** A copy of any existing person's brand or audience. No Candace. No The Blonde Muslim references.
**Core loop:** Reflect → Grow → Connect (Reflections → Guidance → Circle)
**Community tone:** Warm, sisterly, faith-first. Not cold social media energy.
**Privacy posture:** Privacy-first. User data is not shared, not mined, not sold.
**Launch bar:** Amina ships when the core loop works end-to-end with real data. Not before.

---

## CURRENT BUILD STATE (update this section each session)

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase DB | ACTIVE — `endovljmaudnxdzdapmf` | Shared with HireWire/ByRed. Prefixed tables only. |
| GitHub repo | ACTIVE — `rsemeah/redlanternstudios` | Renamed from rsemeah/amina on 2026-06-08 |
| SwarmClaw | ACTIVE — localhost:3456, PM2 managed | PM2 installed 2026-06-08. Startup via launchd. |
| Chat partition | BROKEN — root cause: table conflict | `companion_conversations` vs `amina_conversations` both empty. DEBUG to fix. |
| The Circle | SPECCED — not built | Full spec in `AMINA_MISSION_DAY3.md`. PM decision on DB split pending. |
| amina_profiles | 1 row | Exists. |
| amina_conversations | 0 rows | Broken wiring. |
| amina_messages | 0 rows | Broken wiring. |
| amina_reflections | 0 rows | Not yet wired. |

---

## AGENT ESCALATION RULE (HARD)

**Before opening a question to Ro:**
1. Check this file — is it a Tier 1 decision? → Make the call.
2. Check `AMINA_MISSION_DAY3.md` — is the answer in the spec? → Follow the spec.
3. Check `AGENT_REGISTRY.md` — is it a known config? → Use the config.
4. Still unclear? → It's Tier 2. One sentence recommendation. One sentence reason. Yes/No only.

**If an agent asks Ro a question answerable by this file, that is a system failure.**

---

*Last updated: 2026-06-08 | Maintained by: Claude (Cowork) + Robby after each session*
