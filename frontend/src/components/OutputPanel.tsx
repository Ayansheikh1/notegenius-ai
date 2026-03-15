import { motion, AnimatePresence } from 'framer-motion'
import type { OutputMode, Summary, KeyPoints, FlashcardDeck, Quiz } from '@/types'
import SummaryView    from './SummaryView'
import KeyPointsView  from './KeyPointsView'
import FlashcardsView from './FlashcardsView'
import QuizView       from './QuizView'

interface Props {
  mode: OutputMode
  result: Summary | KeyPoints | FlashcardDeck | Quiz | null
  isLoading: boolean
  error: string | null
}

const EMPTY_MESSAGES: Record<OutputMode, { emoji: string; text: string }> = {
  summary:    { emoji: '📝', text: 'Your structured summary will appear here — overview, themes, details, and key takeaway.' },
  keypoints:  { emoji: '🎯', text: 'The 7 most important insights from your content will be extracted here.' },
  flashcards: { emoji: '🃏', text: 'Flippable study cards will be generated from your content.' },
  quiz:       { emoji: '🧠', text: 'Multiple-choice questions will be created to test your understanding.' },
}

export default function OutputPanel({ mode, result, isLoading, error }: Props) {
  const empty = EMPTY_MESSAGES[mode]

  return (
    <div style={{ minHeight: 400 }}>
      <AnimatePresence mode="wait">
        {/* Loading skeleton */}
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '85%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '70%' }} />
              </div>
            ))}
          </motion.div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <motion.div
            key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(232,93,117,0.08)', border: '1px solid rgba(232,93,117,0.3)',
              borderRadius: 12, padding: '16px 18px', fontSize: 14, color: 'var(--rose)', lineHeight: 1.5,
            }}
          >
            ❌ {error}
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !result && (
          <motion.div
            key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              height: 350, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              color: 'var(--muted)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 52, opacity: 0.35 }}>{empty.emoji}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 260 }}>{empty.text}</div>
          </motion.div>
        )}

        {/* Results */}
        {!isLoading && !error && result && (
          <motion.div
            key={`result-${mode}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {mode === 'summary'    && <SummaryView    data={result as Summary} />}
            {mode === 'keypoints'  && <KeyPointsView  data={result as KeyPoints} />}
            {mode === 'flashcards' && <FlashcardsView data={result as FlashcardDeck} />}
            {mode === 'quiz'       && <QuizView       data={result as Quiz} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
