// ─── Output Modes ────────────────────────────────────────────────────────────
export type OutputMode = 'summary' | 'keypoints' | 'flashcards' | 'quiz'

export type InputTab = 'text' | 'pdf' | 'topic'

// ─── Summary ─────────────────────────────────────────────────────────────────
export interface Summary {
  overview: string
  themes: string[]
  details: string[]
  takeaway: string
}

// ─── Key Points ──────────────────────────────────────────────────────────────
export interface KeyPoints {
  points: string[]
}

// ─── Flashcards ──────────────────────────────────────────────────────────────
export interface Flashcard {
  q: string
  a: string
}
export interface FlashcardDeck {
  cards: Flashcard[]
}

// ─── Quiz ────────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  q: string
  options: string[]   // e.g. ["A. Paris", "B. Berlin", …]
  correct: number     // 0-based index
  explanation?: string
}
export interface Quiz {
  questions: QuizQuestion[]
}

// ─── Note (saved) ────────────────────────────────────────────────────────────
export interface Note {
  id: string
  title: string
  source: string          // 'text' | 'pdf' | 'topic'
  sourceLabel: string     // filename or topic string
  mode: OutputMode
  content: Summary | KeyPoints | FlashcardDeck | Quiz
  createdAt: string       // ISO string
  wordCount?: number
  tags?: string[]
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface GenerateRequest {
  content: string
  mode: OutputMode
  title?: string
}

export interface GenerateResponse {
  noteId: string
  title: string
  mode: OutputMode
  result: Summary | KeyPoints | FlashcardDeck | Quiz
}

export interface UploadResponse {
  uploadUrl: string     // presigned S3 URL
  fileKey: string
  extractedText: string // from Textract / Transcribe
}

// ─── AWS Arch Pills ───────────────────────────────────────────────────────────
export interface AwsService {
  emoji: string
  name: string
  role: string
}
