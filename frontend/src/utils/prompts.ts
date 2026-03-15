import type { OutputMode } from '@/types'

const MAX_CHARS = 8000

export function buildPrompt(content: string, mode: OutputMode): string {
  const trimmed = content.slice(0, MAX_CHARS)

  const prompts: Record<OutputMode, string> = {
    summary: `You are an expert academic summarizer. Analyze the following content and produce a well-structured summary.

Return ONLY valid JSON with this exact shape:
{
  "overview": "2-3 sentence core idea",
  "themes": ["theme1", "theme2", "theme3", "theme4"],
  "details": ["critical fact 1", "critical fact 2", "critical fact 3", "critical fact 4"],
  "takeaway": "single powerful sentence conclusion"
}

Content:
${trimmed}`,

    keypoints: `You are an expert educator. Extract the 7 most important, actionable key points from the content below.

Return ONLY valid JSON with this exact shape:
{
  "points": [
    "Key point 1 — concise and informative",
    "Key point 2 — concise and informative",
    "Key point 3 — concise and informative",
    "Key point 4 — concise and informative",
    "Key point 5 — concise and informative",
    "Key point 6 — concise and informative",
    "Key point 7 — concise and informative"
  ]
}

Content:
${trimmed}`,

    flashcards: `You are a study card expert. Create 6 high-quality flashcards for learning and revision.
Each card has a clear question on the front and a concise answer on the back.

Return ONLY valid JSON with this exact shape:
{
  "cards": [
    { "q": "Clear question?", "a": "Concise answer." },
    { "q": "...", "a": "..." }
  ]
}

Content:
${trimmed}`,

    quiz: `You are an exam question writer. Create 4 multiple-choice questions to test understanding.
Each question has 4 options (only one correct). Include a brief explanation.

Return ONLY valid JSON with this exact shape:
{
  "questions": [
    {
      "q": "Question text?",
      "options": ["A. Option one", "B. Option two", "C. Option three", "D. Option four"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer."
    }
  ]
}

Content:
${trimmed}`,
  }

  return prompts[mode]
}

/** Parse Claude's JSON response safely */
export function parseAIResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim()
  return JSON.parse(cleaned) as T
}
