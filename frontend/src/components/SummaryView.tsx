import { motion } from 'framer-motion'
import type { Summary } from '@/types'

interface Section {
  delay: number
  borderColor: string
  titleColor: string
  bg: string
}

const SECTIONS: Section[] = [
  { delay: 0.04, borderColor: 'var(--amber)',  titleColor: 'var(--amber)',  bg: 'var(--ink-3)' },
  { delay: 0.10, borderColor: 'var(--teal)',   titleColor: 'var(--teal)',   bg: 'var(--ink-3)' },
  { delay: 0.16, borderColor: 'var(--rose)',   titleColor: 'var(--rose)',   bg: 'var(--ink-3)' },
  { delay: 0.22, borderColor: 'var(--purple)', titleColor: 'var(--purple)', bg: 'rgba(155,140,248,0.04)' },
]

export default function SummaryView({ data }: { data: Summary }) {
  const card = (i: number, title: string, content: React.ReactNode) => {
    const c = SECTIONS[i]
    return (
      <motion.div key={i}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: c.delay }}
        style={{
          background: c.bg,
          borderLeft: `3px solid ${c.borderColor}`,
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 12,
          border: `1px solid var(--border)`,
          borderLeftColor: c.borderColor,
          borderLeftWidth: 3,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: c.titleColor, marginBottom: 9 }}>
          {title}
        </div>
        {content}
      </motion.div>
    )
  }

  return (
    <div>
      {card(0, '📋 Overview',
        <p style={{ fontSize: 13, lineHeight: 1.75, color: '#ccc9c0' }}>{data.overview}</p>
      )}
      {card(1, '🗂 Main Themes',
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {data.themes.map((t, i) => (
            <li key={i} style={{ fontSize: 13, color: '#ccc9c0', padding: '5px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--teal)', flexShrink: 0 }}>›</span>{t}
            </li>
          ))}
        </ul>
      )}
      {card(2, '🔍 Critical Details',
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {data.details.map((d, i) => (
            <li key={i} style={{ fontSize: 13, color: '#ccc9c0', padding: '5px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--rose)', flexShrink: 0 }}>→</span>{d}
            </li>
          ))}
        </ul>
      )}
      {card(3, '💡 Key Takeaway',
        <p style={{ fontFamily: '"Syne",sans-serif', fontSize: 14, fontStyle: 'italic', lineHeight: 1.65, color: '#e2ddd4', fontWeight: 500 }}>
          "{data.takeaway}"
        </p>
      )}
    </div>
  )
}
