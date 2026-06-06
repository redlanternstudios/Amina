/**
 * Islamic safety layer for Amina AI responses.
 * Ensures outputs are faith-aligned and do not issue fatwas or replace professional care.
 */

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself',
  'don\'t want to live', 'want to die',
]

const FATWA_KEYWORDS = [
  'is it haram', 'is it halal', 'fatwa', 'ruling on', 'islamically permissible',
  'is it allowed in islam', 'what does islam say about',
]

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw))
}

export function detectFatwaRequest(text: string): boolean {
  const lower = text.toLowerCase()
  return FATWA_KEYWORDS.some((kw) => lower.includes(kw))
}

export const CRISIS_RESPONSE = `Sister, I hear you and I'm here with you. 
What you're feeling matters deeply. Please reach out to someone who can help right now:

🆘 Crisis Text Line: Text HOME to 741741
📞 988 Suicide & Crisis Lifeline: Call or text 988

You are not alone. Allah's mercy is always closer than we think. 🤍`

export const FATWA_DISCLAIMER = `I can share general Islamic perspectives to support your reflection, 
but for specific religious rulings (fatwas), please consult a qualified Islamic scholar. 
Amina is a companion for your heart — not a replacement for scholarly guidance.`

export function applySafetyLayer(userMessage: string): {
  blocked: boolean
  safetyResponse?: string
  disclaimer?: string
} {
  if (detectCrisis(userMessage)) {
    return { blocked: true, safetyResponse: CRISIS_RESPONSE }
  }
  if (detectFatwaRequest(userMessage)) {
    return { blocked: false, disclaimer: FATWA_DISCLAIMER }
  }
  return { blocked: false }
}
