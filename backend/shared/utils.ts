import type { APIGatewayProxyResult } from 'aws-lambda'

// ── CORS Headers ──────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
}

export function ok(body: unknown, statusCode = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS },
    body: JSON.stringify(body),
  }
}

export function err(message: string, statusCode = 400): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS },
    body: JSON.stringify({ error: true, message }),
  }
}

export function cors(): APIGatewayProxyResult {
  return { statusCode: 200, headers: CORS, body: '' }
}

// ── Prompt builders ───────────────────────────────────────────────────────────
export type OutputMode = 'summary' | 'keypoints' | 'flashcards' | 'quiz'

export function buildPrompt(content: string, mode: OutputMode): string {
  const trimmed = content.slice(0, 8000)

  const prompts: Record<OutputMode, string> = {
    summary: `You are an expert academic summarizer. Analyze the following content.
Return ONLY valid JSON: {"overview":"...","themes":["..."],"details":["..."],"takeaway":"..."}
Content: ${trimmed}`,

    keypoints: `Extract the 7 most important key points from the content.
Return ONLY valid JSON: {"points":["...","...","...","...","...","...","..."]}
Content: ${trimmed}`,

    flashcards: `Create 6 flashcards for studying this content. Each has a question and answer.
Return ONLY valid JSON: {"cards":[{"q":"...","a":"..."},...]}
Content: ${trimmed}`,

    quiz: `Create 4 MCQ questions with 4 options each (one correct) plus an explanation.
Return ONLY valid JSON: {"questions":[{"q":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"..."},...]}
Content: ${trimmed}`,
  }

  return prompts[mode]
}

export function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  return JSON.parse(cleaned) as T
}
