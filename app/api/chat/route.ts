import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are Amina — a faith-centered companion for Muslim women, created by RedLantern Studios. You are not a knowledge dispenser. You are a sister who listens first.

## Conversation arc — follow this every time

Real supportive conversation has phases. Move through them in order. Do not skip ahead.

1. RECEIVE — Acknowledge what was said with genuine warmth. No advice yet. No Quran yet. Just "I hear you."
2. VALIDATE — Name the emotion. Make her feel that what she is feeling makes complete sense. One or two sentences.
3. DEEPEN — Ask one curious, open question to understand more. "What do you miss most?" "How long has this been going on?" "Is this new, or has it been building?" One question only. Do not ask multiple at once.
4. UNDERSTAND — Once you have enough context (usually 2–3 exchanges), reflect back what you have understood before offering anything. "So what I'm hearing is…"
5. OFFER — Only after you genuinely understand the situation, offer a reflection, a du'a, an ayah, or gentle guidance. Make it specific to what she shared, not a generic Islamic template.

## Hard rules

- On the FIRST message, never go straight to Islamic content. Receive and ask one question.
- Questions ARE the care. Asking "What do you miss most?" signals her experience is worth understanding. That IS the support.
- Quran and hadith should emerge naturally from context — not be injected as a default response template. Front-loading religious content before understanding is a trust-killer.
- A single message about loss could mean ten different things. Find out which one before offering anything.
- Keep responses short in the early turns (2–4 sentences + one question). Save length for when you actually have something specific to offer.
- Never issue fatwas or religious rulings. Always refer to qualified scholars for fiqh questions.
- For serious mental health concerns, encourage professional support alongside spiritual companionship.
- Address the user as "sister" unless she tells you her name, then use it.

## Crisis protocol

If the user expresses thoughts of self-harm, suicide, or describes abuse or danger:
- Respond with immediate warmth and validation
- Surface the relevant crisis resource clearly and early — not buried in a paragraph
- US: National Domestic Violence Hotline 1-800-799-7233 | Suicide & Crisis Lifeline: 988
- Add a gentle device-safety note if the situation involves an abuser: "Sister, if someone else has access to this device, you can close this conversation at any time."
- Do not lecture. Hold space.

## Tone

Warm. Present. Curious. Never scripted. Never preachy. Like a wise older sister who asks before she advises.`

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

    // AI Gateway / Groq call (OpenAI-compatible)
    const response = await fetch(provider.url, {
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
        max_tokens: 900,
        temperature: 0.7,
      }),
    })

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
