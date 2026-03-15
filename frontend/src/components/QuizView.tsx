import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Quiz } from '@/types'

export default function QuizView({ data }: { data: Quiz }) {
  const questions = data.questions
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [showResults, setShowResults] = useState(false)

  const allAnswered = answers.every(a => a !== null)
  const score = answers.filter((a, i) => a === questions[i].correct).length

  const answer = (qi: number, oi: number) => {
    if (answers[qi] !== null) return
    setAnswers(prev => { const next = [...prev]; next[qi] = oi; return next })
  }

  const reset = () => { setAnswers(Array(questions.length).fill(null)); setShowResults(false) }

  const optionStyle = (qi: number, oi: number): React.CSSProperties => {
    const a = answers[qi]
    const correct = questions[qi].correct
    if (a === null) return baseOpt
    if (oi === correct) return { ...baseOpt, borderColor: 'var(--teal)', background: 'rgba(62,207,178,0.08)', color: 'var(--teal)' }
    if (oi === a)       return { ...baseOpt, borderColor: 'var(--rose)', background: 'rgba(232,93,117,0.08)', color: 'var(--rose)' }
    return { ...baseOpt, opacity: 0.4 }
  }

  return (
    <div>
      {questions.map((q, qi) => (
        <motion.div
          key={qi}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.08 }}
          style={{ background: 'var(--ink-3)', borderRadius: 14, padding: '20px', marginBottom: 16 }}
        >
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 15, fontWeight: 600, color: '#e8e4d8', marginBottom: 14, lineHeight: 1.5 }}>
            Q{qi + 1}. {q.q}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => answer(qi, oi)}
                disabled={answers[qi] !== null}
                style={optionStyle(qi, oi)}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: 'var(--ink)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {String.fromCharCode(65 + oi)}
                </span>
                {opt.replace(/^[A-D]\.\s*/, '')}
              </button>
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {answers[qi] !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                style={{
                  marginTop: 12, fontSize: 13, lineHeight: 1.5,
                  color: answers[qi] === q.correct ? 'var(--teal)' : 'var(--rose)',
                }}
              >
                {answers[qi] === q.correct
                  ? `✅ Correct!${q.explanation ? ' ' + q.explanation : ''}`
                  : `❌ Incorrect — Correct: ${String.fromCharCode(65 + q.correct)}. ${q.explanation || ''}`
                }
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Score */}
      <AnimatePresence>
        {allAnswered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: score === questions.length ? 'rgba(62,207,178,0.1)' : 'rgba(232,168,56,0.08)',
              border: `1px solid ${score === questions.length ? 'rgba(62,207,178,0.3)' : 'rgba(232,168,56,0.3)'}`,
              borderRadius: 14, padding: '24px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '📚'}</div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, color: 'var(--teal)', marginBottom: 4 }}>
              Score: {score} / {questions.length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              {score === questions.length ? 'Perfect score! Outstanding!' : score >= questions.length / 2 ? 'Good job! Keep practicing.' : 'Keep studying, you\'ve got this!'}
            </div>
            <button
              onClick={reset}
              style={{
                background: 'var(--teal)', color: '#0d0f14', border: 'none',
                borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Retry Quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const baseOpt: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '11px 14px', borderRadius: 9, border: '1px solid var(--border)',
  cursor: 'pointer', fontSize: 13, color: '#d8d4c8', transition: 'all 0.2s',
  background: 'transparent', textAlign: 'left', width: '100%',
  fontFamily: '"DM Sans", sans-serif',
}
