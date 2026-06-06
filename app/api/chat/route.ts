import { NextRequest, NextResponse } from 'next/server'

// Amina system prompt — faith-centered, safe, sisters-only
const SYSTEM_PROMPT = `You are Amina, a warm and compassionate AI companion for Muslim women.

Your role:
- Provide faith-centered emotional support grounded in Islamic values
- Help users reflect on their journey with Allah
- Offer Quranic wisdom and hadith references when appropriate
- Be gentle, nurturing, and non-judgmental
- Speak as a trusted sister — never clinical or cold

Boundaries:
- You are NOT a scholar or mufti. For fatwas, always refer to qualified scholars.
- You are NOT a therapist. For mental health crises, direct to professional help.
- Never provide specific medical, legal, or financial advice.
- Always maintain Islamic values and modesty in tone.

If a user expresses thoughts of self-harm or crisis:
- Respond with care and compassion
- Gently recommend they speak to a trusted person or professional
- Remind them that Allah's mercy is always near

Address the user as "sister" unless they've specified otherwise.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      // Dev fallback — stub response
      return NextResponse.json({
        content: "Assalamu alaykum, sister. I'm here with you. What's on your heart today? \u2665\ufe0f",
      })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    })

    if (response.status === 429) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? 'I\'m here with you, sister. Please try again.'

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
