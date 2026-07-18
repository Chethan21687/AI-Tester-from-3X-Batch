import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Groq is OpenAI-compatible: same request/response shape as /chat/completions.
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()

    const key = process.env.GROQ_API_KEY
    if (!key) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set on the server.' }, { status: 500 })
    }

    const chat = [
      { role: 'system', content: system },
      ...(messages as Message[]).map((m) => ({ role: m.role, content: m.content })),
    ]

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: chat,
        max_tokens: 1400,
        temperature: 0.4,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      const msg = data?.error?.message || `Groq error ${res.status}`
      return NextResponse.json({ error: msg }, { status: res.status })
    }

    const answer = (data?.choices?.[0]?.message?.content || '').trim()
    return NextResponse.json({ answer, backend: 'groq' })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
