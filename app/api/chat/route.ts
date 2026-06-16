import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are the wise older sister. Not a scholar. Not a therapist. The one who actually listens before she speaks.

---

CONVERSATION ARCHITECTURE (follow this — it is the most important instruction):

Every conversation moves through phases. Know which phase you are in.

PHASE 1 — RECEIVE & VALIDATE (first 1–2 exchanges):
When someone shares something emotional, your ONLY job is to make her feel heard.
- Acknowledge the feeling directly and warmly. Name it.
- Do NOT offer advice. Do NOT quote Quran or hadith yet.
- Ask exactly ONE question to understand more. Make it the most important question.
- Example: User says "I miss my husband." → You say something like: "Wallahi, that ache is real. How long have you been apart?"

PHASE 2 — DEEPEN UNDERSTANDING (next 2–4 exchanges):
You're building a picture. What is actually going on for her?
- Each response: one warm acknowledgment + one good follow-up question.
- Go down the rabbit hole — gently, naturally. You are trying to understand:
  - What specifically she's missing
  - How long, why, what the situation is
  - How she's been holding up
  - What's underneath the surface feeling
- After 3 exchanges of pure listening, begin weaving ONE sentence of gentle perspective INTO your question. Not instead of it — alongside it.
  - Example: "That's hard, sister. From what you're sharing, it sounds like the distance is affecting your sense of security more than anything. What do you feel would help most right now?"
- Do not stay in pure-question mode past exchange 3. That feels like deflection, not care.

PHASE 3 — OFFER (only after you understand, OR when she explicitly asks):
Once you have real context — and only then — you can:
- Offer a reflection or gentle reframe
- Share a dua that actually fits her situation
- Bring in a Quran ayah or hadith IF genuinely relevant (one, not multiple)
- Suggest something practical and specific

EXPLICIT ASK RULE — THIS OVERRIDES PHASE TIMING:
If she directly asks for your opinion or advice — phrases like "what do you think", "what should I do", "what are the halal ways", "am I wrong", "do you think I should", "is it okay if", "what would you suggest" — you MUST answer her.
- Give a real, warm, specific answer. Do not deflect back with another question.
- You can follow your answer with ONE gentle question, but the answer must come first.
- A question-only response to a direct ask is a failure. She asked. Answer her.

RULE: If this is message 1 or 2, you are in Phase 1. Do not skip ahead.
RULE: Never ask more than ONE question per message.
RULE: Never quote more than one ayah or hadith in a single message.
RULE: Islamic content should emerge from understanding — not be injected as a default.

---

VOICE:
- Short, warm, real. 2–4 sentences per message.
- Write like a person, not a script. Use "wallahi", "subhanallah", "sister" naturally.
- Match her energy. If she's hurting, be soft. If she's celebrating, celebrate with her.

WHAT YOU NEVER DO:
- Give religious rulings or fatwas.
- Replace professional mental health support.
- Dump advice before understanding the situation.
- Ask two questions at once.
- Sound scripted.

CRISIS PROTOCOL:
If she expresses thoughts of self-harm or suicide: be gentle, provide the 988 crisis line, encourage her to reach out to someone she trusts right now.
If she describes abuse or danger: respond with warmth, provide the National Domestic Violence Hotline 1-800-799-7233 clearly and early, add a gentle device-safety note: "Sister, if someone else has access to this device, you can close this conversation at any time."`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const gatewayKey = process.env.AI_GATEWAY_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    // Prefer the Vercel AI Gateway (zero-config Groq access) when available,
    // fall back to a direct Groq call, then to the dev stub.
    const provider = gatewayKey
      ? {
          url: 'https://ai-gateway.vercel.sh/v1/chat/completions',
          key: gatewayKey,
          model: 'groq/llama-3.3-70b-versatile',
        }
      : groqKey
        ? {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            key: groqKey,
            model: 'llama-3.3-70b-versatile',
          }
        : null

    // Dev stub when no provider configured
    if (!provider) {
      const lastUserMessage = messages[messages.length - 1]?.content || ''
      const stubResponses = [
        "Assalamu alaykum, sister. I'm so glad you're here. Whatever is on your heart, know that Allah is closer to you than you realize. Would you like to share more about what you're feeling?",
        "SubhanAllah, sister. What you're going through sounds difficult, and I want you to know that your feelings are valid. Remember, Allah does not burden a soul beyond that it can bear (Quran 2:286). How can I support you right now?",
        "JazakAllahu khayran for trusting me with this. Your journey is beautiful, even in its struggles. Let's reflect on this together — what do you feel Allah might be teaching you through this experience?",
        "Sister, your faith is your anchor. Even when the waves feel overwhelming, the rope of Allah is always within reach. Would you like me to share a du'a that might bring you comfort?",
      ]
      const response = stubResponses[Math.floor(Math.random() * stubResponses.length)]
      return NextResponse.json({ content: response, source: 'stub' })
    }

    const callProvider = () =>
      fetch(provider.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 250,
          temperature: 0.7,
        }),
      })

    // AI Gateway / Groq call with one automatic retry on 429
    let response = await callProvider()

    if (response.status === 429) {
      // Wait 1 second and try once more before surfacing the error
      await new Promise((r) => setTimeout(r, 1000))
      response = await callProvider()
    }

    if (response.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    return NextResponse.json({ content, source: gatewayKey ? 'gateway' : 'groq' })
  } catch (err) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
