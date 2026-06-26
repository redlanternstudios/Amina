# Receipt: Amina Speech Fix — System Prompt Patch

**Date:** 2026-06-17  
**Agent:** PM  
**Priority:** P0  
**Product:** Amina  
**Type:** AI Output Bug  

---

## File Changed

`/Users/rorysemeah/amina/app/api/chat/route.ts`

## What Was Added

### 1. OUTPUT RULES block (prepended at the TOP of SYSTEM_PROMPT)

Positioned before all other instructions. Contains 5 non-negotiable rules:

1. **NEVER output phase labels** — "Phase 1: Receive & Validate", etc. are internal only
2. **NEVER output routing notes** — any "Note:", "(Note:", "If she responds..." instructions are internal only
3. **NEVER use markdown headers** — no `**bold headers**`, no `# headings`, no `---` dividers
4. **Plain prose only** — use *italics* sparingly only if platform renders markdown; when uncertain, plain text only
5. **One response = one voice** — Amina does not section, label, or annotate her process

Includes final validation check: *"Would a caring elder sister say this out loud?"*

### 2. AMINA'S VOICE section (replaces old Tone line)

Defines:
- **Identity:** Not a therapist, not a scholar, not an algorithm — a knowledgeable older sister
- **Tone:** Warm, direct, grounded, honest
- **Opening patterns:** Acknowledge first, don't lecture, don't begin with a citation
- **Good/bad examples** — explicit ✓ and ✗ examples including the forbidden "Phase 1: Receive & Validate"
- **Fiqh question handling:** No rulings, share scholars briefly, cite only when verified, refer to local imam
- **Role, NEVER rules, and Crisis protocol** — preserved from original, now nested under the new structure

### 3. What Was Preserved

- All original role responsibilities (faith-centered support, Quran/Hadith citations, scholar referral, MH referral)
- All NEVER rules (fatwas, MH replacement, Islamic values, data privacy)
- Crisis protocol (988 helpline)
- Phase 1/2/3 framework was **not present** in this file, so nothing was deleted — the OUTPUT RULES block preemptively guards against any future addition of such a framework

### 4. What Was Removed

- Old single line: `Tone: Gentle, nurturing, compassionate, faith-filled. Address the user as 'sister' unless they have specified otherwise.`
- Replaced with comprehensive AMINA'S VOICE section

---

## Verification

- Template literal backtick closes correctly at line 79
- All downstream references to `SYSTEM_PROMPT` unchanged (line 88: `{ role: 'system', content: SYSTEM_PROMPT }`)
- File compiles structurally (no syntax errors in visible diff)
- OLD prompt length: 1,021 chars
- NEW prompt length: 3,315 chars

## Expected Impact

- Model will suppress internal processing labels from output
- Responses will be plain prose with natural conversational flow
- Amina will not announce her phases, routing decisions, or internal notes
- Voice consistency will improve with explicit good/bad examples

---
