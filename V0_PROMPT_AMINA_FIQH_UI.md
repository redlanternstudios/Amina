# V0 PROMPT — AMINA FIQH UI COMPONENTS
**For:** v0.app/redlanternstudios
**Mission:** AMINA-FIQH-V1
**Date:** 2026-06-17

---

## PASTE THIS INTO V0

Build two React components for the Amina Muslim women's faith companion app. Amina uses a chat interface. These components render inside the chat message stream.

---

**Component 1: MosqueCard**

A card that appears in the chat when Amina surfaces nearby mosques. Renders as a list of up to 3 cards stacked vertically inside a chat bubble.

Design requirements:
- Matches Amina's existing chat UI aesthetic: soft, warm, cream/warm white background, rounded corners, gentle shadows
- Each card shows: mosque name (bold), city + address (small, muted), phone number as a tap-to-call link (show phone icon), distance in miles (small pill badge), and a "Get Directions" link that opens Google Maps
- Cards feel like a warm recommendation from a friend, not a database result
- Mobile-first. Phone number and directions should be thumb-friendly tap targets
- Subtle left border accent in a muted green or teal (Islamic color reference, not loud)
- No harsh blacks. Palette: warm off-whites, soft greys, muted accent

Props:
```typescript
interface MosqueCardProps {
  mosques: Array<{
    name: string
    address: string
    phone: string | null
    distance_km: number
    maps_url: string
  }>
}
```

Render behavior:
- If `phone` is null, hide the phone row gracefully (don't show "null" or empty space)
- Distance displays in miles (convert from km: `(km * 0.621371).toFixed(1) + " mi"`)
- "Get Directions" opens `maps_url` in new tab

---

**Component 2: FiqhReferralMessage**

A chat message bubble from Amina that signals she's referring the user to a scholar. This is the Phase 3 message that appears at the end of every Islamic ruling question.

Design requirements:
- Renders as an Amina chat bubble (left-aligned, her avatar, her bubble style)
- Contains the text: *"For a ruling specific to your situation, a qualified imam or Islamic scholar is the right person to ask."*
- Below the text: a soft CTA button — "Find a mosque near me" — styled as a pill button, not aggressive, feels like a gentle suggestion
- Below the button: a small disclaimer line in muted text: *"Amina is a companion, not a scholar."*
- Warm, not clinical. The tone should feel like a caring older sister saying "you should really ask Sheikh about this one"

Props:
```typescript
interface FiqhReferralMessageProps {
  onFindMosque: () => void  // called when user taps the CTA
  timestamp: string
}
```

---

**Visual context for both components:**

Amina's existing chat UI (from the live app at v0.app/redlanternstudios) uses:
- Warm cream/off-white backgrounds
- Soft rounded bubbles
- A crescent moon logo mark
- Warm typography, not techy
- User messages: right-aligned, rose/warm pink bubble
- Amina messages: left-aligned, cream/white bubble with subtle shadow
- Timestamp in small muted text below each bubble

Match this exactly. These components must feel native to the existing chat — not like they were added later.

---

**Deliverable:**
- `MosqueCard.tsx` — standalone exportable component
- `FiqhReferralMessage.tsx` — standalone exportable component
- Both use Tailwind only (no external UI libraries)
- Both are mobile-first
- Export both as named exports from an `index.ts` barrel file
