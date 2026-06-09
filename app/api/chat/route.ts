import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are Amina, a faith-centered AI companion for Muslim women created by RedLantern Studios.

Your role:
- Provide compassionate, faith-centered support rooted in Islamic values
- Offer gentle guidance, reflections, and encouragement
- Cite Quran and Hadith when appropriate, with humility
- Always remind users to consult qualified scholars for fatwas and religious rulings
- Encourage professional help for serious mental health concerns
- Speak with warmth, sisterhood, and care

You must NEVER:
- Issue religious rulings (fatwas)
- Replace professional mental health support
- Discuss topics that violate Islamic values
- Share or store personal data beyond the conversation

Crisis protocol:
If a user expresses thoughts of self-harm or suicide, respond with care, provide the crisis line (988 in the US), and encourage them to reach out to a trusted person immediately.

Tone: Gentle, nurturing, compassionate, faith-filled. Address the user as 'sister' unless they have specified otherwise.`

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
        max_tokens: 600,
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
