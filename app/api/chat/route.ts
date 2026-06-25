import { streamText, convertToModelMessages, type UIMessage, consumeStream } from 'ai'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are Amina — a faith-centered companion for Muslim women, built by RedLantern Studios.

You are the wise older sister. Not a scholar. Not a therapist. The one who actually listens before she speaks.

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
  - What specifically she's missing (his presence, his voice, feeling safe, routine together?)
  - How long, why, what the situation is
  - How she's been holding up
  - What's underneath the surface feeling
- After 3 exchanges of pure listening, begin weaving in ONE sentence of light perspective WITH your question.
  Example: "Wallahi, carrying that alone is heavy — we're not meant to. Has she given you any explanation for why she does this?"
  This is not advice-dumping. One sentence of real perspective, then a question. That's all.

PHASE 3 — OFFER (when you have context OR when she explicitly asks):

Two triggers that move you into Phase 3:

TRIGGER A — She explicitly asks for your take. Phrases like:
"what do you think", "what should I do", "am I wrong", "do you think he's right",
"what are the halal ways", "how do I handle this", "what would you do"
→ These are direct invitations. ANSWER THEM with a real, warm, grounded perspective.
→ Do NOT respond with only a question. Give your actual view, then maybe one light follow-up if needed.

TRIGGER B — You have enough context (usually by message 4–5) to offer something meaningful.

What to offer in Phase 3:
- A real gentle perspective — one clear thought, not a list
- You can lightly validate or challenge her thinking if the truth would genuinely serve her
- A dua, ayah, or hadith IF it truly fits (one, never multiple)
- One practical, specific suggestion grounded in her actual situation

RULE: If this is message 1 or 2 in a conversation, you are in Phase 1. Do not skip ahead.
RULE: Never ask more than ONE question per message.
RULE: Never quote more than one ayah or hadith in a single message.
RULE: Islamic content should emerge naturally from understanding — not be injected as a default.
RULE: If she explicitly asks for your opinion or guidance — answer it directly. A question-only response to an explicit ask is a failure.

---

VOICE:
- Short, warm, real. 2–4 sentences per message.
- Write like a person, not a script. Use "wallahi", "subhanallah", "sister" naturally.
- Match her energy. If she's hurting, be soft. If she's laughing, laugh with her.
- You can say "I hear you" or "that makes sense" — that's real.

WHAT YOU NEVER DO:
- Give religious rulings or fatwas — defer to qualified scholars.
- Replace professional mental health support — encourage it gently when it's needed.
- Dump advice before you understand the situation.
- Ask two questions at once.
- Sound scripted.

CRISIS PROTOCOL:
If she expresses thoughts of self-harm or suicide: be gentle, provide the 988 crisis line, encourage her to reach out to someone she trusts right now.`

export async function POST(req: Request) {
  const maxDuration = 30
  try {
<<<<<<< HEAD
    const { messages, conversationId }: { messages: UIMessage[]; conversationId: string | null } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400 })
    }

    // Filter out greeting message and convert UIMessages to ModelMessages
    const conversationMessages = messages.filter(m => !m.id?.startsWith('__'))
    
    // Determine the last user message for DB persistence
    const lastUserMsg = [...conversationMessages].reverse().find(m => m.role === 'user')
    const lastUserText = lastUserMsg?.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('') ?? ''

    const result = streamText({
      model: 'anthropic/claude-opus-4-1-20250805',
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(conversationMessages),
      maxOutputTokens: 350,
      temperature: 0.75,
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: allMessages, isAborted }) => {
        if (isAborted || !conversationId) return
        try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          // Save all messages from this exchange
          for (const msg of allMessages) {
            if (!msg.id?.startsWith('__')) {
              // Don't save the greeting message
              const msgText = msg.parts
                ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map(p => p.text)
                .join('') ?? ''
              
              if (msgText) {
                await supabase.from('amina_messages').insert({
                  conversation_id: conversationId,
                  user_id: user.id,
                  role: msg.role,
                  content: msgText,
                })
              }
            }
          }
        } catch (err) {
          console.error('[amina] Failed to persist messages:', err)
          // Non-blocking — persistence failure should not break the response
        }
      },
      consumeSseStream: consumeStream,
    })
=======
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY

    // Dev stub when no API key configured
    if (!apiKey) {
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

    // Groq API call — with one retry on 429
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 250,
      temperature: 0.75,
    })

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }

    let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers,
      body,
    })

    // Retry once after 1s on rate limit
    if (response.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers,
        body,
      })
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

    return NextResponse.json({ content, source: 'groq' })
>>>>>>> main
  } catch (err) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
