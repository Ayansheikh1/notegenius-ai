import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FlashcardDeck } from '@/types'

export default function FlashcardsView({ data }: { data: FlashcardDeck }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const cards = data.cards
  const total = cards.length

  const goTo = (i: number) => { setIndex(i); setFlipped(false) }
  const next  = () => goTo((index + 1) % total)
  const prev  = () => goTo((index - 1 + total) % total)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Flashcards · {total} total
        </span>
        <span style={{ fontSize: 12, color: 'var(--amber)' }}>Tap card to reveal answer</span>
      </div>

      {/* Card */}
      <div
        className="flip-card"
        style={{ width: '100%', height: 200, cursor: 'pointer', marginBottom: 16 }}
        onClick={() => setFlipped(f => !f)}
      >
        <div className={`flip-card-inner${flipped ? ' flipped' : ''}`} style={{ width: '100%', height: '100%' }}>
          {/* Front */}
          <div className="flip-card-front" style={{
            position: 'absolute', inset: 0, borderRadius: 16, padding: 28,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            background: 'linear-gradient(135deg, var(--ink-3), var(--ink-2))',
            border: '1px solid rgba(232,168,56,0.25)',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              Question
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ fontFamily: '"Playfair Display", serif', fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: '#e8e4d8' }}
              >
                {cards[index].q}
              </motion.div>
            </AnimatePresence>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>👆 Tap to see answer</div>
          </div>

          {/* Back */}
          <div className="flip-card-back" style={{
            position: 'absolute', inset: 0, borderRadius: 16, padding: 28,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(62,207,178,0.1), var(--ink-2))',
            border: '1px solid rgba(62,207,178,0.25)',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 14 }}>
              Answer
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: '#e8e4d8' }}>
              {cards[index].a}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>✅ Got it?</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={prev} style={navBtn}>← Prev</button>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{index + 1} / {total}</span>
        <button onClick={next} style={navBtn}>Next →</button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {cards.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 10, height: 10, borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s',
              background: i === index ? 'var(--amber)' : 'var(--ink-3)',
              border: `1px solid ${i === index ? 'var(--amber)' : 'var(--border)'}`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: 'var(--ink-3)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '8px 18px', color: '#e8e4d8',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  fontFamily: '"DM Sans", sans-serif', transition: 'all 0.2s',
}
