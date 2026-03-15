import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { OutputMode, Summary, KeyPoints, FlashcardDeck, Quiz } from '@/types'
import { buildPrompt, parseAIResponse } from '@/utils/prompts'

// ─────────────────────────────────────────────────────────────────────────────
// NoteGenius AI — AI hook
//
// LOCAL DEV  → Groq API (free, no credit card)
//              Model: llama-3.3-70b-versatile
//              Proxied via Vite dev server to avoid CORS
//
// PRODUCTION → AWS API Gateway → Lambda → Anthropic Claude via Bedrock
//              Set VITE_API_URL in .env.local to switch
// ─────────────────────────────────────────────────────────────────────────────

// !! PASTE YOUR GROQ API KEY HERE !!
// Get one free at https://console.groq.com → API Keys → Create Key
const GROQ_API_KEY = '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'

const GROQ_MODEL   = 'llama-3.3-70b-versatile'
const GROQ_PROXY   = '/groq/openai/v1/chat/completions'  // proxied via vite

type AIResult = Summary | KeyPoints | FlashcardDeck | Quiz | null

interface UseGenerateReturn {
  result: AIResult
  isLoading: boolean
  error: string | null
  generate: (content: string, mode: OutputMode) => Promise<AIResult>
  reset: () => void
}

export function useGenerate(): UseGenerateReturn {
  const [result, setResult]   = useState<AIResult>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const generate = useCallback(async (content: string, mode: OutputMode): Promise<AIResult> => {
    if (!content.trim() || content.length < 30) {
      const msg = 'Please provide at least 30 characters of content.'
      setError(msg); toast.error(msg); return null
    }

    setLoading(true); setError(null); setResult(null)
    const toastId = toast.loading('⚡ Generating with Groq AI…')

    try {
      const prompt = buildPrompt(content, mode)

      // ── PRODUCTION: AWS Lambda ────────────────────────────────────────────
      if (import.meta.env.VITE_API_URL) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('ng_token') || ''}`,
          },
          body: JSON.stringify({ content, mode }),
        })
        if (!res.ok) { const b = await res.json().catch(()=>({})); throw new Error(b?.message || `Server error ${res.status}`) }
        const data = await res.json()
        const parsed = parseAIResponse<AIResult>(data.rawResponse || JSON.stringify(data.result))
        setResult(parsed)
        toast.success('Notes generated!', { id: toastId })
        return parsed
      }

      // ── LOCAL DEV: Groq API (free) ────────────────────────────────────────
      if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_PASTE_YOUR_GROQ_KEY_HERE') {
        throw new Error('Paste your Groq API key into GROQ_API_KEY in useGenerate.ts — get one free at console.groq.com')
      }

      const res = await fetch(GROQ_PROXY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 1000,
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: 'You are an expert academic note-taker. Always respond with valid JSON only — no preamble, no markdown fences.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message || `Groq API error: ${res.status}`)
      }

      const data = await res.json()
      const raw  = data.choices?.[0]?.message?.content ?? ''

      if (!raw) throw new Error('Empty response from Groq — please try again.')

      const parsed = parseAIResponse<AIResult>(raw)
      setResult(parsed)
      toast.success('Notes generated!', { id: toastId })
      return parsed

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate notes'
      setError(msg)
      toast.error(msg, { id: toastId })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => { setResult(null); setError(null) }, [])

  return { result, isLoading, error, generate, reset }
}
